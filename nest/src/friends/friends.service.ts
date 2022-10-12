import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, Socket } from "src/typeorm";
import { FriendRequest } from "src/typeorm/entities/friend-request";
import { FriendRequestStatus } from "src/typeorm/entities/friend-request-interface";
import { UsersService, SocketService } from '../users/users.service';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';


// this decorator will allow us to make use of the socket.io functionnalitu
@WebSocketGateway({ cors: 'http://localhost:4200' })
@Injectable()
export class FriendsService {
    @WebSocketServer() server;
    users: number = 0;

    constructor (
        private usersServ : UsersService,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private socketService: SocketService,
        @InjectRepository(Socket) private socketRepo : Repository<Socket>,
        @InjectRepository(FriendRequest)
        private readonly friendRequestRepository: Repository<FriendRequest>) {}

/*checks if there is already a request between users (so as not to have duplicates)*/
async hasRequestBeenSentOrReceived(
    sender: User, 
    receiver: User
    ): Promise<boolean> {
       
        const check = await this.friendRequestRepository.findOne({
            where: [
            { senderId: sender.id, receiverId: receiver.id },
            { senderId: receiver.id, receiverId: sender.id },
        ],
        });
        if (!check)
            return false;
        return true;
    }

    /*checks if there is already a request between users (so as not to have duplicates)*/
    async hasSentMe(
        User: User, 
        Me: User
        ): Promise<FriendRequest | { error: string }> {
           
            const check = await this.friendRequestRepository.findOne({
                where: [
                { senderId: User.id, receiverId: Me.id },
            ],
            });
            /*si on trouve pas, on retourne un error: string*/
            if (!check)
            {
                return { error: "Not found"};
            }
            /*if request matching criteria is found in database, return the request*/
            return check;
        }

/*envoyer une requete + gerer de possibles erreurs*/
async sendFriendRequest(receiverId: number, sender: User): Promise<FriendRequest | { error: string }> {
    if (receiverId == sender.id)
        return {error: "You cant add yourself as a friend, loser"};
    const receiver = await this.usersServ.findUserById(receiverId);
    if (await this.hasRequestBeenSentOrReceived(sender, receiver) == true )
        return {error: "You have already sent a request, chill"};
    /*si ca rentre pas dans les cas d'exceptions, on change le status a 'pending' dans le db pour "envoyer une requete"*/
    let MyFriendRequest: FriendRequest = {
        id: null, senderId:sender.id, receiverId:receiverId, sender:sender, receiver:receiver, status: 'pending'
    }
    const ret = this.friendRequestRepository.save(MyFriendRequest);
    this.server.emit('changeReqs', {receiver: receiver.id});
    return ret;
}

/*retourne le status d'un requete precise*/
async getFriendRequestStatus(receiverId: number, sender: User): Promise<FriendRequestStatus> {
    const receiver = await this.usersServ.findUserById(receiverId);
    const MyReq = await this.friendRequestRepository.findOne({
        where: [
        { senderId: sender.id, receiverId: receiverId },
    ],
    });
    return MyReq.status;
}

/*retourne la requete en cherchant l'ID de la requete*/ 
async getFriendRequestUserById(FriendRequestId: number) : Promise<FriendRequest>{
    return this.friendRequestRepository.findOne({where: {id: FriendRequestId}} );
}

/*change le status d'une requete (FriendRequestID) a la valeur de {newStatus}-> accepted/pending/rejected*/
async respondToFriendRequest(FriendRequestId: number, newStatus: FriendRequestStatus) : Promise<FriendRequestStatus> {
    const friendReq = await this.getFriendRequestUserById(FriendRequestId);
    friendReq.status = newStatus;
    const ret = await this.friendRequestRepository.save(friendReq);
    if (newStatus == "accepted")
    {
        this.server.emit('changeFriends', {sender: friendReq.senderId}, {receiver: friendReq.receiverId});
    }
    return ret.status;
}

/*chercher pour les requetes "pending" pour cet utilisateur*/
async getReceivedFriendRequests(currentUser: User) : Promise<any> {
    const temp = await this.friendRequestRepository.find({
        relations: ["sender"],
        where: [ {receiverId: currentUser.id, status: "pending"}],
    });
    return temp;
}

/*retourn un string [] de tous les logins dans le db Users*/
async getAllLogins() : Promise<string[]>{
        let userz = await this.userRepo.find(
            {
                select: ["login"],
            }
        );
        /*recupere tous les .login avec map*/
        let ret : string[] = userz.map( userz => userz.login );
        return ret;
    }

/*retourne tous les requetes envoyes par cet utilisateur*/
async getSentFriendRequests(currentUser: User) : Promise<FriendRequest[]> {
    return this.friendRequestRepository.find({where:{senderId: currentUser.id }});
}

/*Trouver tous les requetes dans le db de requetes qui sont "accepte" et etaient soit envoye ou recu par cet utilisateur*/
async getFriendList(currentUser: User) : Promise<User[]> { 
    //QUERY ONE: get all rows from friend_request where status == accepted and sender is currentUser 
    //autrement dit: get all friend requests sent by current user and accepted by receiver
    let group_one = await this.friendRequestRepository.find( 
        { relations: ["sender", "receiver"],
        where: [
            { senderId: currentUser.id, status: "accepted" },
        ],
    }
    );
     //QUERY TWO: get all rows from friend_request where status == accepted and receiver is currentUser
     //Autrement dit: get all friend requests accepted by the current user
    let group_two = await this.friendRequestRepository.find( 
        { relations: 
            ["sender", "receiver"],
        where: [
            { receiverId: currentUser.id, status: "accepted" },
        ],
    }
    );
    //get the users who accepted this user's friend requests OR get the users who sent requests to this user which have been accepted, i.e. FRIENDS!
    let friends1 : User[] = group_one.map( group_one => group_one.receiver);
    let friends2 : User[] = group_two.map( group_two => group_two.sender);
    //retourne friends1 + friends2
   return friends1.concat(friends2);
}
}

