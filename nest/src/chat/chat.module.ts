import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomService } from './service/room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from 'src/typeorm';
import { User } from 'src/typeorm';
import { SocketService, UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';


@Module({
    // before the gateway will start we need to add oit to the providers here
    imports: [TypeOrmModule.forFeature([RoomEntity])],
    providers: [ChatGateway, RoomService]
})
export class ChatModule {}
