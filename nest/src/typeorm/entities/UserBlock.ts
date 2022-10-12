import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class UserBlock implements IUserBlock {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    blockingUserId : number;
    
    @Column()
    blockedUserId: number;
}

export interface IUserBlock {
    id?: number;
    blockingUserId? : number;
    blockedUserId? : number;
}