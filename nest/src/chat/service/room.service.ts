import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from 'src/typeorm/entities/Room';
import { Repository } from 'typeorm';
import { IRoom } from 'src/typeorm/entities/Room';
import { User } from 'src/typeorm/entities/User';
import { UsersService } from 'src/users/users.service';
import '../chat.module';
import { RoomUser } from 'src/typeorm/entities/RoomUser';

@Injectable()
export class RoomService {
    constructor (
        @InjectRepository(RoomEntity) private readonly roomRepo : Repository<RoomEntity>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(RoomUser) private roomUserRepo: Repository<RoomUser>,
        private userServ : UsersService
     ) {}

     async createRoom(idUser: number, isPrivate:boolean, isDm:boolean, nameRoom: string): Promise<IRoom> {
      try {
       let room;
      if (isDm === true)
        room = {creatorId: -1, private: isPrivate, directMessage: isDm, name: nameRoom};
      else
        room = {creatorId: idUser, private: isPrivate, directMessage: isDm, name: nameRoom};
       if (nameRoom.length > 50 || nameRoom.includes("--") || nameRoom.includes(";") || nameRoom.includes(" "))
        return (null);
      const does_exist = await this.roomRepo.findOne({where: {name: nameRoom} });
      if (does_exist && (room.directMessage === true)){
        return does_exist;
      }
        const newRoom = await this.roomRepo.save(room);
      if (does_exist && (room.directMessage === false)){
        await this.roomRepo.update({id:newRoom.id}, {name:newRoom.name + "-" + (newRoom.id).toString()})
      }
      return (await this.roomRepo.findOne({where:{id:newRoom.id}}));
    } catch(e) {
      return (null)
    }
     }
    

 async associateUserRoom(room:IRoom, idUser: number, isPrivate:boolean, isDm:boolean, isAdmin:boolean) {
      let newuserRoom;
      if (isPrivate === false)
      {
        const theUser = await this.userServ.findUserById(idUser);
        const userRoom = {userId: idUser, user: theUser, roomId: room.id, isAdmin: isAdmin};
        newuserRoom = await this.roomUserRepo.save(userRoom);
      }
      else if (!isDm)
      {
        const theUser = await this.userServ.findUserById(idUser);
        const userRoom = {userId: idUser, user: theUser, roomId: room.id, isAdmin: isAdmin};
        newuserRoom = await this.roomUserRepo.save(userRoom);
      }
      return newuserRoom;
    }

    async addAllUser(room : IRoom, idCreator:number) {
      const allUser = await this.userServ.findAll();
      let idRoomCreate = 0;
      for (let entry of allUser) {
          
        const theUser = await this.userServ.findUserById(entry.id);
        let userRoom = {userId: entry.id, user: theUser, room: room, roomId: room.id};
        let newRoomUser = await this.roomUserRepo.save(userRoom);
        if (entry.id === idCreator)
          idRoomCreate = newRoomUser.id;
      }
        return (await this.roomUserRepo.findOne({where:{id:idRoomCreate}}));
    }

    async getRoomIdFromRoomName(name: string) {
      const retRoom = await this.roomRepo.findOne( {where:{name: name} });
      return retRoom ? retRoom.id : null;
    }

    async getRoomNameFromId(idRoom: number) {
      const retRoom = await this.roomRepo.findOne( {where:{id: idRoom} });
      return retRoom ? retRoom.name : null;
    }
    async getRoomCreatorFromId(idRoom: number) {
      const retRoom = await this.roomRepo.findOne( {where:{id: idRoom}} );
      return retRoom ? retRoom.creatorId : null;
    }
    async getRoomPrivateFromId(idRoom: number) {
      const retRoom = await this.roomRepo.findOne( {where:{id: idRoom} });
      return retRoom ? retRoom.private : null;
    }
     
}