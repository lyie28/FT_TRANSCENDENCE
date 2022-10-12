/* aurel */
import { Module } from "@nestjs/common";
import { UsersController } from './users.controller';
import {SocketService, UsersService} from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Socket, User, Games, UserBlock } from "src/typeorm";
import { FriendRequest } from "src/typeorm/entities/friend-request";
import { RoomUser } from '../typeorm/entities/RoomUser';
import { RoomEntity } from '../typeorm/entities/Room';
import { RoomService } from "src/chat/service/room.service";

@Module({
    imports: [TypeOrmModule.forFeature([User, Socket, FriendRequest, Games,  RoomUser, RoomEntity,UserBlock])],
    exports: [],
    controllers: [UsersController],
    providers: [UsersService, SocketService, RoomService],
})
export class UsersModule{

}