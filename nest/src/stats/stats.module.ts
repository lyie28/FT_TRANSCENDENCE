import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from 'src/game/game.gateway';
import { User } from 'src/typeorm';
import { Games } from 'src/typeorm';
import { FriendRequest } from 'src/typeorm/entities/friend-request';
import { UsersService } from 'src/users/users.service';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Games, FriendRequest])],
  exports: [],
  controllers: [StatsController],
  providers: [StatsService, UsersService]
})
export class StatsModule {}
