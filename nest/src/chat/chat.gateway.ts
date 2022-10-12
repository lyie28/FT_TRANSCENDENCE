/* https://www.joshmorony.com/creating-a-simple-live-chat-server-with-nestjs-websockets/ */

import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import {
    WebSocketGateway,
    WebSocketServer, 
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { IntraAuthGuard } from 'src/auth/guards';
import { Socket, User, RoomEntity, Message, Games, RoomUser, UserBlock } from 'src/typeorm';
import { UsersService, SocketService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { RoomService } from './service/room.service';
import { MessageService } from './service/message.service';

export var gameQueue = [];
export var gameQueueSmach = [];

// this decorator will allow us to make use of the socket.io functionnalitu
@WebSocketGateway({ cors: 'http://localhost:4200' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    // We set up a variable 'server' with the decorator which will give us access to the server instance
    // we then can use this to trigger events and send data to connected clients
    @WebSocketServer() server;
    users: number = 0;

    constructor(
        @InjectRepository(User) private userRepo : Repository<User>,
        private socketService: SocketService,
        @InjectRepository(Socket) private socketRepo : Repository<Socket>,
        @InjectRepository(RoomEntity) private roomRepo: Repository<RoomEntity>,
        @InjectRepository(RoomUser) private roomUserRepo: Repository<RoomUser>,
        @InjectRepository(UserBlock) private userBlockRepo: Repository<UserBlock>,
        @InjectRepository(Message) private messageRepo: Repository<Message>,
        @InjectRepository(Games) private gameRepo: Repository<Games>,
        private messageService: MessageService,
        private roomService: RoomService,
        private userService: UsersService,
        ) {}


    // The handle connection hooks will keep track of clients connections and disconnection
    async handleConnection(client) {
        // A client has connected
        this.users++;
        const whichuser = await this.socketRepo.findOne({where: {name:client.id}});
        // Notify connected clients of current users
        this.server.emit('users', this.users);
    }

    async handleDisconnect(client) {
        const date1 = new Date(Date.now());
        var hours = date1.getHours() + 2;
        if (hours > 12)
            hours = hours % 12;
        hours = hours + 12;
        date1.setHours(hours);
        const the_date = date1.toLocaleString();// moment().tz("Europe/Paris").format('dddd Do MMM YY, hh:mm');
        // A client has disconnected
        this.users--;
        await this.disconnectGame(client, the_date);
        await this.socketRepo.createQueryBuilder().delete().where({ name: client.id }).execute();
        this.server.emit('users', this.users);
    }

    @SubscribeMessage('join')
    async joinRoom(client, name) {
      client.join(name);
    }

    @SubscribeMessage('leave')
    async leaveRoom(client, name) {
      client.leave(name);
    }
    @SubscribeMessage('logout')
    async logOut(client, infos) {
       this.server.to('sockets' + infos.userId).emit('logoutGame');
       this.server.to('sockets' + infos.userId).emit('logout');
    }
    
    @SubscribeMessage('disco')
    async disconnect(client) {
        client.disconnect();
    }

    //--------------------------------------------------------------------------------------------//
    //----------------------------------CHAT------------------------------------------------------//
    //--------------------------------------------------------------------------------------------//

    /* Recupere tous les salon publics existants dans la db */
    @SubscribeMessage('fetchsalon')
    async fetch_salon(client, userId) {
        const salons = await this.roomRepo.find({where: { private : false }});
        let tab = []
        const userRooms = await this.roomUserRepo.find({where: {userId: userId}});
        const userRoomIds = userRooms.map((it) => it.roomId);
        for (let entry of salons)
        {
            var displayName;
            if (entry.name.length > 10)
                displayName = entry.name.substring(0,9) + "...";
            else
               displayName = entry.name;
            if (!userRoomIds.includes(entry.id))
                tab.push({id:entry.id, name: entry.name, display:displayName});
        }
        client.emit('fetchsalon', tab);
     }

    /* Recupere tous les messages de la table RoomId [room] sauf ceux des utilisateurs bloqués et les formatte pour l'affichage, les emit au front */
    /* {nameSalon: currentSalon.name, idUser: props.actualUser.id} */
    @SubscribeMessage('fetchmessage')
    async fetch_message(client, data) {
        const message = await this.messageRepo.find({relations: ["sender"], where: { roomID : data.roomId }});//await this.roomService.getRoomIdFromRoomName(data.nameSalon) }});
        /* Récupération de l'id des users bloqués par le client dans un tableau*/
        const blockedUsers = await this.userBlockRepo.find({where: {blockingUserId: data.idUser}});
        const arrayBlockedUsers = blockedUsers.map((it) => it.blockedUserId);
        const room = (await this.roomRepo.findOne({where: {id:data.roomId}}));
        const dm = room.directMessage;
        /* Concatene userName et le contenu du message si celui ci n'a pas été envoyé par quelqu'un de bloqué*/
        let tab = [];
        for (let entry of message)
        {
                if (arrayBlockedUsers.includes(entry.sender.id))
                    continue;
                tab.push({id: entry.id, sender: entry.sender.id, message: entry.content, senderLog: entry.sender.login})
            }
        tab = tab.sort((a,b) => a.id- b.id);
        client.emit('fetchmessage', tab);
    }
    
    @SubscribeMessage('just-block')
    async justBlock(client, user)
    {
        this.server.to('sockets' + user.id).emit('just-block');
    }
      

    /* Un user join une room ou crée une conversation privée, on cree une entre userRoom */
    /* {userId: props.user.id, room: roomname, otherLogin: friend.login} */
    @SubscribeMessage('user_joins_room')
    async user_joins_room(client, infos) {

        if(infos.roomId && !infos.otherLogin)
        {
            const roomUser = await this.roomUserRepo.findOne({where: {userId:infos.userId, roomId:infos.roomId}});
            if (roomUser && roomUser.ban === true)
            {
                const date = new Date().getTime();
                if (date >= roomUser.expireBan.getTime())
                    await this.roomUserRepo.update({id:roomUser.id}, {ban:false});
                else
                    return;
            }
        }
        /* On fait rejoindre au client la room débutant par le mot clé salonRoom pour éviter les conflits */
        this.server.in('sockets' + infos.userId).socketsJoin('salonRoom' + infos.roomId);
        /* On communique au front le nom d'affichage : soit le nom du salon soit le login du friend si c'est un dm */
        const dm = !(!infos.otherLogin);
        let adm = false;
        var displayName;        
        if(dm) {
        if (infos.otherLogin.length > 10)
            displayName = infos.otherLogin.substring(0,9) + "...";
        else
            displayName = infos.otherLogin;
        }
        const theRoom = await this.roomRepo.findOne({where :{ id : infos.roomId }});
        if (!dm) {
            if (infos.room.length > 10)
                displayName = infos.room.substring(0,9) + "...";
            else
                displayName = infos.room;
            const theUser = await this.userService.findUserById(infos.userId);
            let myUserRoom = await this.roomUserRepo.findOne({where:{userId: infos.userId, roomId: infos.roomId}});
            if (!myUserRoom)
            {
               const getNewUserRoom = {id: null, userId: infos.userId, user: theUser, room: theRoom, roomId: infos.roomId, mute: false,
                   ban: false, isAdmin: false, expireBan: null, expiredMute: null};
                myUserRoom = await this.roomUserRepo.save(getNewUserRoom);
            }
        adm = myUserRoom.isAdmin;
       }
       /* On emit le nom du salon ajoute pour afficher dans les front de chaque socket du user */
       this.server.to('sockets' + infos.userId).emit('joinedsalon', {salonName: infos.room, dm: dm, displayName: displayName, roomId:infos.roomId, isAdmin:adm, creator: theRoom.creatorId, private:theRoom.private}); 
    }

    /* Un user quitte la room, on supprime une entre userRoom */
    @SubscribeMessage('user_leaves_room')
    async user_leaves_room(client, infos) {
        await this.roomUserRepo.delete({ userId: infos.userId, roomId: infos.roomId})
        this.server.in('sockets' + infos.userId).socketsLeave('salonRoom' + infos.roomId);
        /* On emit le nom du salon quitté pour en informer tous les fronts */
        this.server.to('sockets' + infos.userId).emit('leftsalon', infos.room)
    }

    @SubscribeMessage('new-owner')
    async newOwner(client, info) {
      this.server.to('sockets' + info).emit('new-owner');
    }

    @SubscribeMessage('delete_room')
    async deleteRoom(client, infos) {
        const allMembers = await this.roomUserRepo.find({where:{roomId: infos.roomId}});
        for(let entry of allMembers) {
            let infoMember = {userId:entry.userId, roomId:infos.roomId, room:infos.room};
            await this.user_leaves_room(client, infoMember);
        }
        await this.roomRepo.delete({id:infos.roomId});
    }

    @SubscribeMessage('user_isBan_room')
    async user_isBan_room(client, infos) {
      this.server.in('sockets' + infos.userId).socketsLeave('salonRoom' + infos.roomId);
      /* On emit le nom du salon quitté pour en informer tous les fronts */
      this.server.to('sockets' + infos.userId).emit('leftsalon', infos.room)
    }

    /* Recoit un message et un room dans laquelle re-emit le message */
    /* {roomToEmit: currentSalon.name, message : event.target.value, whoAmI: actualUser, isDm: currentSalon.isDm} */
    @SubscribeMessage('chat')
    async onChat(client, data) {
        //any clients listenning  for the chat event on the data.roomToEmit channel would receive the message data instantly
        const time = new Date(Date.now()).toLocaleString();
        if (data.isDm === false)
        {
            const roomUser = await this.roomUserRepo.findOne({where: {userId:data.whoAmI.id, roomId:data.roomId}});
            const date = new Date().getTime();
            if (roomUser.mute === true){
               if (date >= roomUser.expiredMute.getTime())
                  await this.roomUserRepo.update({id:roomUser.id}, {mute:false});
                else
                    return;
            }
        }
        /* on récupère les infos de block */
        /* on fait un array constitué de tous les salons de sockets qui nous ont blouqués pour ne pas leur emit grâce à .except */
        const newMes = await this.messageService.addMessage(data.message, data.roomToEmit, data.whoAmI.id, data.roomId); 
        let bannedMe = await this.userBlockRepo.createQueryBuilder().where({ blockedUserId: data.whoAmI.id }).execute();
        bannedMe.forEach(function(el, id, arr) {
            arr[id] = 'sockets' + arr[id].UserBlock_blockingUserId;
        });
        /* on emit seulement aux sockets des 2 users si c'est un dm, sinon à tout le salon */
        if (data.isDm) {
            let disp;
            if (data.whoAmI.login.length > 10)
                disp = data.whoAmI.login.substring(0,9) + "...";
            else
                disp = data.whoAmI.login;
            const otherUserId = data.roomToEmit.endsWith(data.whoAmI.id) ? data.roomToEmit.split('.')[0] : data.roomToEmit.split('.')[1];
            //  this.server.to('sockets' + otherUserId).except(bannedMe).emit('chat', {emittingRoom: data.roomToEmit, sender: data.whoAmI.id, message: '[' + data.whoAmI.login + '] ' +  '[' + time + '] ' + data.message, displayName: data.whoAmI.login});
            //  this.server.to('sockets' + data.whoAmI.id).emit('chat', {emittingRoom: data.roomToEmit,sender: data.whoAmI.id, message: '[' + data.whoAmI.login + '] ' +  '[' + time + '] ' + data.message, dontNotif: true});
            this.server.to('sockets' + otherUserId).except(bannedMe).emit('chat', {id:newMes.id, emittingRoom: data.roomToEmit, sender: data.whoAmI.id, senderLog:data.whoAmI.login, message: data.message,dontNotif: false, displayName: disp, roomId:data.roomId, creator:data.creator});
            this.server.to('sockets' + data.whoAmI.id).emit('chat', {id:newMes.id,emittingRoom: data.roomToEmit, sender: data.whoAmI.id, senderLog:data.whoAmI.login, message: data.message, dontNotif: true, roomId:data.roomId, creator:data.creator, private:data.private});
        }
        else {
            bannedMe.push('sockets' + data.whoAmI.id);
            let disp;
            if (data.roomToEmit.length > 10)
                disp = data.roomToEmit.substring(0,9) + "...";
            else
                disp = data.roomToEmit;
        //on coupe en deux avec un broadcast et un server.to(mysockets) pour différencier notifs et pas notifs
        //   this.server.to('sockets' + data.whoAmI.id).emit('chat', {emittingRoom: data.roomToEmit, sender: data.whoAmI.id, message: '[' + data.whoAmI.login + '] ' +  '[' + time + '] ' + data.message, displayName: data.roomToEmit, dontNotif: true});
        this.server.to('salonRoom' + data.roomId).except(bannedMe).emit('chat', {id:newMes.id,emittingRoom: data.roomToEmit, sender: data.whoAmI.id, senderLog:data.whoAmI.login, message: data.message, displayName: disp, dontNotif: false,roomId:data.roomId, creator:data.creator,private:data.private});
        this.server.to('sockets' + data.whoAmI.id).emit('chat', {id:newMes.id,emittingRoom: data.roomToEmit, sender: data.whoAmI.id, senderLog:data.whoAmI.login, message: data.message, displayName: disp, dontNotif: true, roomId:data.roomId, creator:data.creator, private:data.private});
        }
    }

    @SubscribeMessage('whoAmI')
    async linkUserSocket(client, user) {
      const sock = this.socketRepo.create();
      sock.name = client.id;
      sock.user = user;
      sock.idUser = user.id;
      await this.socketRepo.save(sock);
      if (user.isPlaying === true)
        await this.userRepo.update({id:user.id}, {isConnected:true, color:'rgba(255, 0, 255, 0.9)'});
      else
        await this.userRepo.update({id:user.id}, {isConnected:true, color:'rgba(0, 255, 0, 0.9)'});
      this.server.emit('changeColor');
      /* on join la room avec tous les sockets du user, elle s'appelera par exemple sockets7 pour l'userId 7 */
      client.join('sockets' + user.id);
      /* on boucle sur les roomUser pour faire rejoindre à ce socket toutes les rooms du user, hors dm car pas besoin de les rejoindre (communication socket à socket) */
      const rooms = await this.roomUserRepo.createQueryBuilder().where({ userId: user.id }).execute();
      for (let room of rooms) {
          var roomName = await this.roomService.getRoomNameFromId(room.RoomUser_roomId);
          client.join('salonRoom' + room.RoomUser_roomId);
      }
    }

    // event d'emit d'ajout de salon pour affichage dynamique dans le menu AddSalon
    // /!\ Rien n'écoute l'event newsalon pour l'instant, le re-emit est donc inutile
    @SubscribeMessage('addsalon')
    async addsalon(client, infos) {

        const newRoom = await this.roomService.createRoom(infos[0], infos[1], infos[2], infos[3]);
        if (!newRoom)
        {
            client.emit("invalid");
            return;
        }
        const roomUser = await this.roomService.associateUserRoom(newRoom, infos[0], infos[1], infos[2], true);
        if (infos[2] === false && roomUser.id)
            await this.roomUserRepo.update({id: roomUser.id}, {isAdmin:true});
        let disp;
        if ((newRoom.name).length > 10)
            disp = (newRoom.name).substring(0,9) + "...";
        else
            disp = (newRoom.name);
            this.server.emit('newsalon', (newRoom.name));
        this.server.to('sockets' + infos[0]).emit('joinedsalon', {salonName: (newRoom.name), dm: false, displayName: disp, roomId:newRoom.id, creator:infos[0], isAdmin:true, private:infos[1]}); // add owner = true;
        if (infos.length > 4)
            this.user_joins_room(client, {userId: infos[0], room: (newRoom.name), otherLogin: infos[4], roomId:newRoom.id})
        else 
            this.user_joins_room(client, {userId: infos[0], room: (newRoom.name), roomId:newRoom.id})
    }

    @SubscribeMessage('changeInfos')
    async changeInfos(client, infos) {
       // const tab = await this.roomRepo.find({where: {}})
        this.server.to('sockets'+ infos.id).emit('changeInfos');
        if (infos.new_login)
        {
        const display_login = (infos.new_login.length > 10) ? (infos.new_login).substring(0,9) + "..." : infos.new_login;
        this.server.except('sockets'+ infos.id).emit('someoneChangedLogin', {otherId: infos.id, newLogin: display_login});
        }
    }

    @SubscribeMessage('friendrequestnotif')
    async sendFriendRequest(client, data) {
        this.server.to('sockets' + data.id).emit('newfriendrequest', data.new);
    }

    //--------------------------------------------------------------------------------------------//
    //----------------------------------GAME------------------------------------------------------//
    //--------------------------------------------------------------------------------------------//
    
    @SubscribeMessage('initGame')
    async initGame( client, user)
    {
        let res;
        res = gameQueue.find(element => user === element.user.id);
        if (res) {
            this.server.to(client.id).emit("already-ask");
            return ;
        }
        res = gameQueueSmach.find(element => user === element.user.id);
        if (res) {
            this.server.to(client.id).emit("already-ask");
            return ;
        }
  
        const allGame = await this.gameRepo.findOne( { where: [{playerLeft:user, finish:false}, {playerRight:user, finish:false}]} );
        //  for (let entry of allGame) {
         // if ((entry.playerLeft === user || entry.playerRight === user) && entry.finish === false) {
         if (allGame) {  
            this.joinRoom(client, allGame.id+'-players');
            const data = {roomname:allGame.id, sL:allGame.scoreLeft, sR:allGame.scoreRight, player1:allGame.playerLeft, player2:allGame.playerRight, smash :allGame.smash};
            this.server.to(allGame.id+'-players').emit("game-start", data);
            this.server.to(allGame.id+'-watch').emit("game-start", data);
            await this.userRepo.update({id:user.id}, {isConnected:true, color:'rgba(255, 0, 255, 0.9)'});
            this.server.emit('changeColor');
            return;
          }
     // }
    }

    async launchMatch(userL, userR, v, client, userClient)
    {
        let roomName;
        const details = {
            playerLeft: userL.id,
            playerRight: userR.id,
            userLeft: userL,
            userRight: userR,
            smash : v,
        }
        const newGame = await this.gameRepo.save(details);

        await this.userRepo.update({id:userL.id}, {isPlaying:true, color:'rgba(255, 0, 255, 0.9)'});
        await this.userRepo.update({id:userR.id}, {isPlaying:true, color:'rgba(255, 0, 255, 0.9)'});
        this.server.emit('changeColor');
        roomName = newGame.id+'-players';
        this.joinRoom(client, roomName);
        let other;
        if (userL.id === userClient.id)
            other = userR;
        else
            other = userL;
        this.server.to('sockets'+other.id).emit("joinroom",  roomName);
        this.server.to('sockets'+userClient.id).emit("joinroomOnly",  roomName);

    }

    async matchMake(tabMatch, v, user, client)
    {
        if(tabMatch.length % 2 === 0) 
        {      
            this.launchMatch(tabMatch[0].user, tabMatch[1].user, v, client, user);
            tabMatch.splice(0,2);
        }
        else
            this.server.to('sockets'+ user.id).emit("already-ask");
        }

    @SubscribeMessage('acceptMatch')
    async acceptMatch(client, infos) {
        this.launchMatch(infos[0], infos[1], infos[2], client, infos[1]);
    }

    @SubscribeMessage('warnOpponent')
    async warnOpponent(client, infos) {
        this.server.to('sockets' + infos).emit("noMoreMatch");
    }

    @SubscribeMessage('rejectMatch')
    async rejectMatch(client, infos) {
        this.server.to('sockets' + infos[0].id).emit("opponent-quit");
    }

    @SubscribeMessage('createGame')
    // param 'client' will be a reference to the socket instance, param 'data.p1' is the room where to emit, data.p2 is the message
    async createNewGame(socket: Socket, infos) {
        const tab = { sock: socket, user: infos[0] };
        if(!gameQueue.find(element => infos[0].id === element.user.id)
            && !gameQueueSmach.find(element => infos[0].id === element.user.id))
        {
            if (infos[1] === 1) {
                gameQueueSmach.push(tab);
                this.matchMake(gameQueueSmach, infos[1], infos[0], socket);
            }
            else {
                gameQueue.push(tab);
                this.matchMake(gameQueue, infos[1], infos[0], socket);
            }
        }
        
    }

    @SubscribeMessage('moveDown')
    async  paddleDown(client, infos) { //infos[0]=userId, infos[1]=roomGameId, infos[2]=allPos
        if (infos[2].playerL === infos[0] )
        {
            const pos = infos[2].posHL;
            let newPos = pos + 10;
            if(newPos + infos[2].paddleSize >= infos[2].height)
                newPos = infos[2].height - infos[2].paddleSize;
            this.server.to(infos[1]+'-players').emit("left-move", newPos);
            this.server.to(infos[1]+'-watch').emit("left-move", newPos);
        }
        else if (infos[2].playerR === infos[0])
        {
            const pos = infos[2].posHR;
            let newPos = pos + 10;
            if(newPos + infos[2].paddleSize >= infos[2].height)
                newPos = infos[2].height - infos[2].paddleSize;
            this.server.to(infos[1]+'-watch').emit("right-move", newPos);
            this.server.to(infos[1]+'-players').emit("right-move", newPos);
        }
    }

    @SubscribeMessage('moveUp')
    async  paddleUp(client, infos) { //infos[0] == userId, infos[1] == roomGameId , infos[2] == allPos
        if (infos[2].playerL === infos[0] )
        {
            const pos = infos[2].posHL;
            let newPos = pos - 10;
            if(newPos <= 0)
                newPos = 0;
            this.server.to(infos[1]+'-players').emit("left-move", newPos);
            this.server.to(infos[1]+'-watch').emit("left-move", newPos);
        }
        else if (infos[2].playerR === infos[0])
        {
            const pos = infos[2].posHR;
            let newPos = pos - 10;
            if(newPos <= 0)
                newPos = 0;
            this.server.to(infos[1]+'-players').emit("right-move", newPos);
            this.server.to(infos[1]+'-watch').emit("right-move", newPos);
        }
    }

    @SubscribeMessage('ball')
    async  updateBallX(server, infos) { //infos[0] == roomName , infos[1] = allPos
        /*date for game table*/
        const date1 = new Date(Date.now());
        var hours = date1.getHours() + 2;
        if (hours > 12)
            hours = hours % 12;
        hours = hours + 12;
        date1.setHours(hours);
        const the_date = date1.toLocaleString();// moment().tz("Europe/Paris").format('dddd Do MMM YY, hh:mm');
      
        let width = infos[1].width; 
        let height = infos[1].height; 
        var ballRadius = infos[1].ballRadius;
        var dx = infos[1].deltaX;
        var dy = infos[1].deltaY;
        var by = infos[1].ballY;
        var bx = infos[1].ballX;
        var sL = infos[1].scoreL;
        var sR = infos[1].scoreR;
        var newSleep = infos[1].sleep;
        var smachX = infos[1].smachX;
        var smachY = infos[1].smachY;
        var login;
        var finished : boolean = false;
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }   
        var posL = infos[1].posHL;
        var posR = infos[1].posHR;
        var paddleW = infos[1].paddleLarge;
        var paddleH = infos[1].paddleSize;
        var speed = infos[1].speed;

        if (by >= infos[1].smachY - (height/30)/2 && by <= infos[1].smachY + (height/30)/2
        && bx >= infos[1].smachX - (height/30)/2 && bx <= infos[1].smachX + (height/30)/2)
    {
        var randomX = Math.floor(Math.random() * width - (width/8)) + width/8;
        var randomY = Math.floor(Math.random() * height - (height/8)) + height/8;
        if (speed === 1)
        {
            speed = 3;
            dx = dx * speed;
            dy = dy * speed;
        }
        speed = 3;
        smachX = randomX;
        smachY = randomY;
    }
    /* si la balle est sur les bord haut et bas du board */
    if((by + dy > height ) || (by + dy < 0)) {
        dy = -dy;
    } 
    
    /* si la balle touhce les bords du paddle */
    // if ((bx < paddleW && posL <= by && posL + paddleH >= by) 
    //     || (bx > width - paddleW && posR <= by  &&  posR + paddleH >= by)) {
    //         dy = -dy / speed;
    //         dx = dx /speed;
    //         speed = 1;
          
    //     }
    // /* si la balle touhce la longueur du paddle */
    // else if ((bx === paddleW && posL <= by && posL + paddleH >= by) 
    //     || ((bx === width - paddleW && posR <= by && posR + paddleH >= by))) {
    //         dx = -dx / speed;
    //         dy = dy/speed;
    //         speed = 1;
            
    // }
    bx = bx + dx;
    by = by + dy;

    if(bx > width - paddleW && by >= posR && by <= posR + paddleH) {
        if (dx > 0)
        {
            dx = -dx / speed;
            dy = dy/speed;
            speed = 1;
        }
    }
    else if (bx < paddleW && by >= posL && by <= posL + paddleH) {
        if (dx < 0) {
            dx = -dx / speed;
            dy = dy/speed;
            speed = 1;
        }
    }
    else if(bx > width) {
        sL += 1;
        bx = infos[1].width/2;
        by = infos[1].height/2;
        dx = dx / speed;
        dy = dy / speed;
        speed = 1;            
        newSleep = true;
        await this.gameRepo.update( {id : infos[0]}, {scoreLeft:sL});
    }
    else if (bx < 0) {
        sR += 1;
        bx = infos[1].width/2;
        by = infos[1].height/2;
        dx = dx / speed;
        dy = dy/speed;
        speed = 1;
        newSleep = true;
        await this.gameRepo.update( {id : infos[0]}, {scoreRight:sR});
    }
        if(bx > width) {
            sL += 1;
            bx = infos[1].width/2;
            by = infos[1].height/2;
            dx = dx / speed;
            dy = dy / speed;
            speed = 1;            
            newSleep = true;
            await this.gameRepo.update( {id : infos[0]}, {scoreLeft:sL});
        }
        if (bx < 0) {
            sR += 1;
            bx = infos[1].width/2;
            by = infos[1].height/2;
            dx = dx / speed;
            dy = dy/speed;
            speed = 1;
            newSleep = true;
            await this.gameRepo.update( {id : infos[0]}, {scoreRight:sR});
        }
        if (sL >= 11 && sR < sL - 1) {
            const idGame = await this.gameRepo.findOne({where:{id:infos[0]}});
            this.gameRepo.update( {id : infos[0]}, {winner: idGame.playerLeft, looser:idGame.playerRight, finish:true, scoreLeft:sL, scoreRight:sR, date:the_date});
            const user = await this.userRepo.findOne({where:{id: idGame.playerLeft}});
            login = user.login;
            if (finished == false) {
                const win = (await this.gameRepo.find({where: {winner:idGame.playerLeft}})).length;
                await this.userRepo.update({id: idGame.playerLeft}, {total_wins:win});
                finished = true;
            }
            this.server.to(infos[0]+'-watch').emit("game-stop", user.login);
            this.server.to(infos[0]+'-players').emit("game-stop", user.login);
        }
        if (sR >= 11 && sL < sR - 1) {

            const idGame = await this.gameRepo.findOne({where:{id:infos[0]}});
            this.gameRepo.update( {id : infos[0]}, {winner: idGame.playerRight, looser: idGame.playerLeft, finish:true, scoreLeft:sL, scoreRight:sR, date:the_date});
            const user = await this.userRepo.findOne({where:{id: idGame.playerRight}});

            login = user.login;
            if (finished == false) {
                const win = (await this.gameRepo.find({where: {winner:idGame.playerRight}})).length;
               await this.userRepo.update({id: idGame.playerRight}, {total_wins:win});
               finished = true;
           }
            this.server.to(infos[0]+'-watch').emit("game-stop", user.login);
            this.server.to(infos[0]+'-players').emit("game-stop", user.login);
        }
        if (newSleep === true) {
            let ball = {x : infos[1].width/2, y: infos[1].height/2, scoreLeft: sL, scoreRight: sR, dx:dx, dy:dy, sleep: newSleep, speed: speed, smX : smachX, smY: smachY, login : login}
            this.server.to(infos[0]+'-watch').emit("updatedBall", ball);
            this.server.to(infos[0]+'-players').emit("updatedBall", ball);
            await sleep(500);
            this.server.to(infos[0]+'-watch').emit("end-wait", ball);
            this.server.to(infos[0]+'-players').emit("end-wait", ball);
            // newSleep = false;
            // ball = {x : bx, y: by, scoreLeft: sL, scoreRight: sR, dx:dx, dy:dy, sleep: newSleep, speed:speed, smX: smachX, smY:smachY, login: login}
            // this.server.to(infos[0]+'-watch').emit("updatedBall", ball);
            // this.server.to(infos[0]+'-players').emit("updatedBall", ball);
        }
        else {
            let ball = {x : bx, y: by, scoreLeft: sL, scoreRight: sR, dx:dx, dy:dy, sleep: newSleep, speed : speed, smX: smachX, smY: smachY, login: login}
            this.server.to(infos[0]+'-players').emit("updatedBall", ball);
            this.server.to(infos[0]+'-watch').emit("updatedBall", ball);
        }
    }

    @SubscribeMessage('updateScore')
    async updateScore(client, infos)
    {
        await this.gameRepo.update( {id : infos[0]}, {scoreLeft:infos[1], scoreRight:infos[2]});
    }

    @SubscribeMessage('abort-match')
    async abortMatch(client, infos)
    {
        if (!infos[0])
        {
            var i = 0;
            for (let entry of gameQueue)
            {
                if (entry.user.id === infos[3])
                {
                    gameQueue.splice(i, i+ 1);
                    break;
                }
                 i++;
            }
            i = 0;
            for (let entry of gameQueueSmach)
            {
                if (entry.user.id === infos[3])
                {
                    gameQueue.splice(i, i+ 1);
                    break;
                }
                 i++;
            }
            this.server.to('sockets' + infos[3]).emit("opponent-quit");
     
            return ;
        }
        await this.gameRepo.update( {id : infos[0]}, {scoreLeft:infos[1], scoreRight:infos[2], abort:true});
        this.server.to(infos[0]+'-players').emit("opponent-quit");
        this.server.to(infos[0]+'-watch').emit("opponent-quit");
    }

    @SubscribeMessage('finish-match')
    async endMatch(client, infos)
    {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve,ms));
        }
        await sleep(1000);
        if (!infos[0])
        {
            this.server.to('sockets'+ infos[1]).emit("restart");
            return;
        }
        const idGame = await this.gameRepo.findOne({where:{id:infos[0]}});
        this.gameRepo.update( {id : infos[0]}, {scoreLeft:idGame.scoreLeft, scoreRight:idGame.scoreRight, finish: true});
        await this.userRepo.update({id: idGame.playerLeft}, {isPlaying:false, color:'rgba(0,255,0,0.9)'});
        await this.userRepo.update({id: idGame.playerRight}, {isPlaying:false, color:'rgba(0,255,0,0.9)'});
        this.server.emit('changeColor');
        this.server.to(infos[0]+'-players').emit("restart"); // a la fin d' un match, tout les joueurs ont leur jeu reset
        this.server.to(infos[0]+'-watch').emit("restart"); //a la fin d' un match, tout les spectateurs ont leur jeu reset
        this.server.to(infos[0]+'-watch').emit("leaveroom", infos[0]+'-watch'); //a la fin d' un match, tout les spectateur quittent la room qu'ils ecoutaient
        this.server.to(infos[0]+'-players').emit("leaveroom", infos[0]+'-players'); //a la fin d' un match, tout les joueurs quittent la room qu'ils ecoutaient
    }

    @SubscribeMessage('watch-friend')
    async watchFriend(client, infos) {
        const findGame = await this.gameRepo.find({
            where: [
                {playerLeft:infos[0], finish:false},
                {playerRight:infos[0], finish:false}
            ]});
            this.watchMatch(client, {idGame:findGame[0].id, user:infos[1]});
    }

    @SubscribeMessage('watch-match')
    async watchMatch(client, infos) { //infos[0] = idRoom of game infos[1] == user ask for watch
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        const idGame = await this.gameRepo.findOne({relations: ["userLeft", "userRight"], where : {id:infos.idGame}});
        if (idGame.finish === true)
        {
            this.server.to(client.id).emit("end-before-watch");
            await sleep(1000);
            this.server.to(client.id).emit("restart");
            return ;
        }
        const userL = idGame.userLeft.login;
        const userR = idGame.userRight.login;
        const watchRoom = infos.idGame + '-watch';
        this.joinRoom(client, watchRoom);
        const data = {watchRoom: watchRoom, loginL:userL, loginR:userR}
        this.server.to(watchRoom).emit('watch', data);
    }

    @SubscribeMessage('defeat')
    async defeat(client, infos) {
        //for block
        if (infos[0].color === 'rgba(255,0,255,0.9)')
            return;
        const isBlock = await this.userBlockRepo.find({where: {blockingUserId: infos[0].id, blockedUserId:infos[1]}});
        const isBlock2 = await this.userBlockRepo.find({where: {blockingUserId: infos[1], blockedUserId:infos[0].id}});
        const user2 = await this.userRepo.findOne({where:{id: infos[1]}});
        if (isBlock.length > 0 || isBlock2.length > 0 ||  user2.isPlaying === true)
        {
            this.rejectMatch(client, infos);
            return ; 
        }
        this.server.to('sockets'+infos[0].id).emit('defeat', infos[1]);
        const data = {user:infos[0], version:infos[2] };
        this.server.to('sockets'+infos[1]).emit('ask-defeat', data);
    }

    async twoPlayerDisconnect(the_date, entry, opponent)
    {

        const clients = await this.server.in('sockets' + opponent).allSockets();
        if (clients.size === 0)
        {
            let win = 0;
            let loose = 0;
            if (entry.scoreLeft > entry.scoreRight)
               {
                    win = entry.playerLeft;
                    loose = entry.playerRight;
                }
               if (entry.scoreRight > entry.scoreLeft)
                {
                    win = entry.playerRight;
                    loose = entry.playerLeft;
                }
            await this.gameRepo.update( {id : entry.id}, {/*winner: win, looser:loose,*/ date: the_date, finish: true, abort:true});
            await this.userRepo.update({id:entry.playerLeft}, {isPlaying:false, color:'rgba(0,255,0,0.9)'});
            await this.userRepo.update({id:entry.playerRight}, {isPlaying:false, color:'rgba(0,255,0,0.9)'});
            this.server.emit('changeColor');
            this.server.to(entry.id+'-watch').emit("restart");
            this.server.to(entry.id+'-players').emit("restart");
            this.server.to(entry.id+'-watch').emit("leaveroom", entry.id+'-watch');
            this.server.to(entry.id+'-players').emit("leaveroom", entry.id+'-players');
        }
    }

    async deleteQueue(tab, userId)
    {
        var i = 0;
        for (let entry of tab) {
            if (entry.user.id === userId) {
                tab.splice(i, i+1);
                break;
            }
            i++;
        }
    }

    async disconnectGame(client, the_date)
    {
        const whichuser = await this.socketRepo.findOne({where: {name:client.id}});
        if(whichuser)
        {
            const clients = await this.server.in('sockets' + whichuser.idUser).allSockets();
            if (clients.size === 0)
            {
                await this.userRepo.update({id:whichuser.idUser}, {isConnected:false, color:'rgba(255, 0, 0, 0.9)'});
                this.server.emit('changeColor');
                this.deleteQueue(gameQueue, whichuser.idUser);
                this.deleteQueue(gameQueueSmach, whichuser.idUser);
       
               const room = await this.gameRepo.find({where: [{playerLeft:whichuser.idUser, finish:false}, {playerRight:whichuser.idUser, finish: false}]});
               for (let entry of room)
                {
                    this.server.to(entry.id+'-players').emit("opponent-leave");
                    this.server.to(entry.id+'-watch').emit("opponent-leave");
                    if (whichuser.idUser === entry.playerLeft)
                        await this.twoPlayerDisconnect(the_date, entry, entry.playerRight);
                    else if (whichuser.idUser === entry.playerRight)
                        await this.twoPlayerDisconnect(the_date, entry, entry.playerLeft);
                }
            }
        }
    }
}