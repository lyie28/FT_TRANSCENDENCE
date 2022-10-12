import {ISession } from 'connect-typeorm';
import { Index, Column, PrimaryColumn, Entity } from 'typeorm';

/*this is where we store our cookies*/
@Entity()
export class TypeORMSession implements ISession {
    @Index()
    @Column('bigint')
    expiredAt: number;

    @PrimaryColumn('varchar', { length: 255})
    id: string;

    @Column('text')
    json: string;
}