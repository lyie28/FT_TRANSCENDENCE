import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/typeorm/entities/message';
import { Repository } from 'typeorm';
import { IMessage } from 'src/typeorm/entities/message';
import { RoomService } from './room.service';
import '../chat.module';
@Injectable()
export class MessageService {
    constructor (
        @InjectRepository(Message) private readonly messageRepo : Repository<Message>,
       private roomServ : RoomService
     ) {}

     async addMessage(content: string, roomName: string, idUser: number, idRoom:number) {
       // const newRoom = await this.addCreatorInRoom(room, creator);
      // const roomId = await this.roomServ.getRoomIdFromRoomName(roomName);
       
      const mess = {senderId: idUser, roomID: idRoom, content: content};
       return (await this.messageRepo.save(mess));
     }
}