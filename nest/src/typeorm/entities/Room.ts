import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToMany, JoinTable, OneToOne, OneToMany } from "typeorm";
import { User } from "src/typeorm";
import IUser from "src/typeorm/entities/User";
import { RoomUser } from './RoomUser';
import { IsNotEmpty, MaxLength, IsAlphanumeric } from 'class-validator';

@Entity()
export class RoomEntity implements IRoom {

    @PrimaryGeneratedColumn()
    id: number;
 
    @Column({nullable: true})
    name: string;

    @Column({default: false})
    private: boolean;

    @Column({default: false})
    directMessage: boolean;

    @OneToMany(() => RoomUser, RoomUser => RoomUser.user)
    room_user: RoomUser[];

    @Column({nullable:true})
    password: string;

    @Column()
    creatorId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
}



export interface IRoom {
    id?: number;
    name? : string;
    private? : boolean;
    directMessage? : boolean;
    room_user?: RoomUser[];
    password?: string;
    creatorId? : number;
    createdAt?: Date;
    updatedAt? : Date;
}