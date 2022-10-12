import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games, Socket } from 'src/typeorm';
import { FriendRequest } from 'src/typeorm/entities/friend-request';
import { User } from 'src/typeorm/entities/User';
import { UsersService, SocketService } from 'src/users/users.service';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, FriendRequest, Socket, Games])],
  exports: [],
  controllers: [FriendsController],
  providers: [FriendsService, UsersService, SocketService]
})
export class FriendsModule {}
