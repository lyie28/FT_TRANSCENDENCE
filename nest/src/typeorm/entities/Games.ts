import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from "..";

@Entity()
export class Games implements IGames {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    playerLeft: number;

    @Column()
    playerRight:number;

    @Column({default: 0})
    scoreLeft: number;

    @Column({default: 0})
    scoreRight: number;

    @Column({nullable:true})
    winner: number;
    
    @Column({nullable:true})
    looser: number;

    @Column({nullable:true})
    date: string;

    /*Plusiers matchs mais chaque fois un jouer gauche/droite donc ManyToOne()*/
    @ManyToOne(() => User, User => User.userLeft)
    userLeft: User;

    @ManyToOne(() => User, User => User.userRight)
    userRight: User;

    @Column()
    smash : number;

    @Column({default:false})
    finish: boolean;

    @Column({default:false})
    abort: boolean;

}

export interface IGames {
    id?: number;
    playerLeft?: number;
    playerRight?: number;
    scoreLeft?: number;
    scoreRight?: number;
    winner?: number;
    /*ajoute d'users*/
    userLeft ?: User;
    userRight ?: User;
    smash: number;
    looser?: number;

    finish?: boolean;
    abort? : boolean;
}