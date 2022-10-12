import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, ManyToOne } from "typeorm";
import { User } from "./User";


@Entity()
export class Message implements IMessage {

    @PrimaryGeneratedColumn()
    id: number;
 
    @Column()
    senderId :number;
    
    @ManyToOne(() => User, User => User.sender)
    sender: User;
   
    @Column()
    roomID : number;

    @Column()
    content: string;

    @CreateDateColumn()
    createdAt: Date;
}



export interface IMessage {
    id?: number;
    senderId?: number;
    sender?: User;
    roomId?: number;
    content?:string;
  
}