import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from 'src/chat/service/room.service';
import { Games, RoomEntity, RoomUser, Socket, User } from 'src/typeorm';
import { FriendRequest } from 'src/typeorm/entities/friend-request';
import { SocketService, UsersService } from 'src/users/users.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway'

@Module({
    // before the gateway will start we need to add it to the providers here
    imports: [ TypeOrmModule.forFeature([User,Games, Socket, RoomEntity,RoomUser, FriendRequest])], 
    controllers: [GameController],
    providers: [GameGateway, RoomService, SocketService, UsersService]
})
export class GameModule {}