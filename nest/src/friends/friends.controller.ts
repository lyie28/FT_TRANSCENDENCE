import { Controller, Get, Post, Delete, Headers, UseGuards, Req, Param, Put, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FriendsService } from './friends.service';
import { AuthenticatedGuard } from 'src/auth/guards';
import { FriendRequest } from 'src/typeorm/entities/friend-request';
import { User } from 'src/typeorm/entities/User';
import { FriendRequestStatus } from 'src/typeorm/entities/friend-request-interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('friends')
export class FriendsController {
    constructor(private friendServ : FriendsService,
    private usersServ : UsersService, @InjectRepository(User) private userRepo:Repository<User>,
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>) {}

     /* send friend request to receiverId*/
     @UseGuards(AuthenticatedGuard)
     @Get('friendRequest/send/:receiverId')
     async sendFriendRequest(
        @Param('receiverId') receiverStringId: string,
        @Req() request,
     ): Promise<FriendRequest | { error: string }> { 
      const receiverId = parseInt(receiverStringId);
      if (!Number.isInteger(receiverId))
         return { error: "invalid receiver id" };
      const the_user = await this.userRepo.findOne({where: [{ id: receiverId}],
      });
      if (!the_user)
         return null;
      const requestSent = this.friendServ.sendFriendRequest(receiverId, request.user);
      return requestSent ;
     }

      /*returns all your friends*/
      @UseGuards(AuthenticatedGuard)
      @Get('friendRequest/me/friendlist')
      async getFriendList(
         @Req() request,
      ) : Promise<User[]> {
      return await this.friendServ.getFriendList(request.user);
      }

     /*check status of friend request that we have sent to receiverID*/
     @UseGuards(AuthenticatedGuard)
     @Get('friendRequest/testing/:SenderId')
     async testing(
        @Param('SenderId') SenderStringId: string,
        @Req() request,
     ): Promise<FriendRequest | { error: string; }> {
      const SenderId = parseInt(SenderStringId);
      if (!Number.isInteger(SenderId))
         return { error: "invalid receiver id" };
      const sender = await this.usersServ.findUserById(SenderId);
      if (!sender)
         return null;
      return this.friendServ.sendFriendRequest(request.user.id, sender);
     }

   /*check status of friend request that we have sent to receiverID*/
     @UseGuards(AuthenticatedGuard)
     @Get('friendRequest/status/:receiverId')
     async getFriendRequestStatus(
        @Param('receiverId') receiverStringId: string,
        @Req() request,
     ): Promise<FriendRequestStatus> {
      const receiverId = parseInt(receiverStringId);
      if (!Number.isInteger(receiverId))
         return null;
      const the_user = await this.userRepo.findOne({where: [{ id: receiverId}],
         });
      if (!the_user)
         return null;
      const status = this.friendServ.getFriendRequestStatus(receiverId, request.user);
      return status ;
     }

      /*respond to friend request with newStatus (accepted/declined/pending) */
      @UseGuards(AuthenticatedGuard)
      @Get('friendRequest/accept/:friendRequestId')
      async acceptFriendRequest(
         @Param('friendRequestId') friendRequestStringId: string,
      ): Promise<FriendRequestStatus> {
       const friendRequestId = parseInt(friendRequestStringId);
       if (!Number.isInteger(friendRequestId))
         return null;
      const the_req = await this.friendRequestRepository.findOne({where: [{ id: friendRequestId}],});
      if (!the_req)
         return null;
      return this.friendServ.respondToFriendRequest(friendRequestId, "accepted");
      }

      /*rejects friend request indicated*/
      @UseGuards(AuthenticatedGuard)
      @Get('friendRequest/reject/:friendRequestId')
      async rejectFriendRequest(
         @Param('friendRequestId') friendRequestStringId: string,
      ): Promise<FriendRequestStatus> {
       const friendRequestId = parseInt(friendRequestStringId);
       if (!Number.isInteger(friendRequestId))
         return null;
      const the_req = await this.friendRequestRepository.findOne({where: [{ id: friendRequestId}],});
      if (!the_req)
         return null;
       return this.friendServ.respondToFriendRequest(friendRequestId, "rejected");
      }

      /*returns all your PENDING received friend requests*/
     @UseGuards(AuthenticatedGuard)
     @Get('friendRequest/me/received-requests')
     async getReceivedFriendRequests(
        @Req() request,
     ): Promise<FriendRequest[]> {
      return this.friendServ.getReceivedFriendRequests(request.user);
     }

     /*Checks if user has already sent a friend request to you. If yes, returns the request. If not, returns an error message*/
     @UseGuards(AuthenticatedGuard)
     @Get('friendRequest/me/hasSentMe/:Userlogin')
     async hasSentMe(
      @Param('Userlogin') user_login : string,
      @Req() request,
      ): Promise<FriendRequest | { error: string }> {
      /*get user from login*/
      const the_user = await this.userRepo.findOne({where: [{ login: user_login}],
      });
      if (!the_user)
         return null;
      return this.friendServ.hasSentMe(the_user, request.user);
   }

      /*returns all user.logins in database*/
     @Get('/getAllLogins')
     async getLogins() : Promise<string[]>
     {
        return this.friendServ.getAllLogins();
     }

      /*returns all your sent friend requests*/
      @UseGuards(AuthenticatedGuard)
      @Get('friendRequest/me/sent-requests')
      async getSentFriendRequests(
         @Req() request,
      ): Promise<FriendRequest[]> {
       return this.friendServ.getSentFriendRequests(request.user);
      }
    }
