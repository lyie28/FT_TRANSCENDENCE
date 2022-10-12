import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, Timestamp} from "typeorm";
import { User } from './User';
import { RoomEntity } from './Room';

@Entity()
export class RoomUser implements IRoomUser {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId : number;

    @ManyToOne(() => User, User => User.Rooms)
    user : User;

    @ManyToOne(() => RoomEntity, RoomEntity => RoomEntity.room_user)
    room : RoomEntity;
    
    @Column()
    roomId: number;

    @Column({default:false})
    mute: boolean;

    @Column({default:false})
    ban : boolean;

    @Column({default:false})
    isAdmin : boolean;

    @Column({nullable:true})
    expiredMute: Date;

    @Column({nullable:true})
    expireBan: Date;
}

export interface IRoomUser {
    id?: number;
    userId? : number;
    user? : User;
    room: RoomEntity;
    roomId? : number;
    mute?: boolean;
    ban?: boolean;
    isAdmin?: boolean;
    expiredMute?: Date;
    expiredBan?:Date;
}