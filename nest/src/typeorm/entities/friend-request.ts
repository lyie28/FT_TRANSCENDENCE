/*laura*/

import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './User';
import { FriendRequestStatus } from './friend-request-interface';

@Entity()
export class FriendRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    senderId: number;

    @Column()
    receiverId:number;
    
    @ManyToOne(() => User, User => User.RequestsSent)
    sender: User;

    @ManyToOne(() => User, User => User.RequestsReceived)
    receiver: User;

    @Column()
    status: FriendRequestStatus;

}