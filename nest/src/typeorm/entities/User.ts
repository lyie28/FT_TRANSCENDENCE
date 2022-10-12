/*samantha laura*/

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, OneToMany, OneToOne, Check } from 'typeorm';
import { RoomEntity } from './Room';
import { Socket } from './Socket';
import { FriendRequest } from './friend-request';
import { Games } from '..';
import { Message } from './message';
import { RoomUser } from './RoomUser';
import { IsAlphanumeric, IsEmail, IsNotEmpty } from 'class-validator';


@Entity({ name: 'users' })
export class User implements IUser { // donne la composition de User, permet de creer de nouvelles colonnes pour de nouvelles donnees concernant l'utilisateur, 
    @PrimaryGeneratedColumn({ name: 'user_no'})
    id: number;

    @Column({ name: 'Intra_id'})
    intraId: string;

    @Column({ name: 'Intra_login', nullable: true } )
    @IsAlphanumeric()
    @IsNotEmpty()
    login: string;

    @Column({ name: 'Avatar_url', nullable: true })
    avatar: string;

    @Column({unique: true, nullable: true})
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @OneToMany(() => FriendRequest, FriendRequest => FriendRequest.sender)
    RequestsSent: FriendRequest[]; 

    @OneToMany(() => FriendRequest, FriendRequest => FriendRequest.receiver)
    RequestsReceived: FriendRequest[]; 

    @OneToMany(() => RoomUser, RoomUser => RoomUser.user)
    Rooms: RoomUser[];

    /*historique de matchs ou on est le jouer a gauche*/
    @OneToMany(() => Games, Games => Games.userLeft)
    userLeft: Games[]; 

    /*historique de matchs ou on est le jouer a droite*/
    @OneToMany(() => Games, Games => Games.userRight)
    userRight: Games[]; 

    @OneToMany(() => Message, Message => Message.sender)
    sender : Message[];

    @Column({default: undefined, nullable:true})
    authConfirmToken: number;

    @Column({default: false})
    isVerified: boolean;

    @Column({default: true})
    isConnected: boolean;

    @Column({default: false})
    isPlaying: boolean;

    @Column({default:false})
    twoFA: boolean;

    @Column({default:"rgba(0,255,0, 0.9)"})
    color: string;

    @Column({default: 0})
    total_wins: number;
 
    @OneToMany(() => Socket, socket => socket.user)
    socket: Socket[];

    @CreateDateColumn()
    createAt: Date;

    @Column({default: true})
    first : boolean;
    
}

interface IUser {
        id:number;
        login: string;
        intraId: string;
        avatar: string;
        email: string;
        authConfirmToken?: number;
        isVerified: boolean;
        isConnected:boolean;
        isPlaying?: boolean;
        createAt: Date;
        twoFA?: boolean;
        total_wins: number;
        color?:string;
        first?: boolean;
    }
    export default IUser;
