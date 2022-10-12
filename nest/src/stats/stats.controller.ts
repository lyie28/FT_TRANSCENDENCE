import { Controller, Get, Post, Delete, Headers, UseGuards, Req, Param, Put, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticatedGuard } from 'src/auth/guards';
import { Games, User } from 'src/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { StatsService } from './stats.service';


@Controller('stats')
export class StatsController {
   constructor(private statsServ : StatsService, @InjectRepository(User) private userRepo:Repository<User>) {}
     /*Game stats*/
     @UseGuards(AuthenticatedGuard)
     @Get('getWins')
   async getWins(
     @Req() request,
    ) : Promise<number>
    {
       return this.statsServ.getWins(request.user);
    }

    @UseGuards(AuthenticatedGuard)
     @Get('getLosses')
    async getLosses(
     @Req() request,
    ) : Promise<number>
    {
       return this.statsServ.getLosses(request.user);
    }

    @UseGuards(AuthenticatedGuard)
     @Get('getWinsFriend/:friendLogin')
    async getWinsFriend(
      @Param('friendLogin') friendLogin: string,
     @Req() request,
    ) : Promise<number>
    {
      const friendUser = await this.userRepo.findOne({where: [{ login: friendLogin}],
      });
      if (!friendUser)
         return null;
      return this.statsServ.getWins(friendUser);
    }

    @UseGuards(AuthenticatedGuard)
     @Get('getLossesFriend/:friendLogin')
    async getLossesFriend(
      @Param('friendLogin') friendLogin: string,
     @Req() request,
    ) : Promise<number>
    {
      const friendUser = await this.userRepo.findOne({where: [{ login: friendLogin}],
      });
      if (!friendUser)
         return null;
      return this.statsServ.getLosses(friendUser);
    }

    @UseGuards(AuthenticatedGuard)
     @Get('getMatchHistoryFriend/:friendLogin')
    async getMatchHistoryFriend(
      @Param('friendLogin') friendLogin: string,
      @Req() request,
    ) : Promise<Games[]>
    {
      const friendUser = await this.userRepo.findOne({where: [{ login: friendLogin}],
      });
      if (!friendUser)
         return null;
      return this.statsServ.getMatchHistory(friendUser);
    }

    @UseGuards(AuthenticatedGuard)
    @Get('getRankingFriend/:friendLogin')
    async getRankingFriend(
      @Param('friendLogin') friendLogin: string,
      @Req() request,
    ) : Promise<number>
    {
      const friendUser = await this.userRepo.findOne({where: [{ login: friendLogin}],
      });
      if (!friendUser)
         return null;
      return this.statsServ.getRankingFriend(friendUser);
    }

    @UseGuards(AuthenticatedGuard)
    @Get('getRanking')
    async getRanking(
      @Req() request,
    ) : Promise<number>
    {
      return this.statsServ.getRankingFriend(request.user);
    }

    
    @UseGuards(AuthenticatedGuard)
     @Get('getMatchHistory')
    async getMatchHistory(
      
     @Req() request,
    ) : Promise<Games[]>
    {
      return this.statsServ.getMatchHistory(request.user);
    }

    @UseGuards(AuthenticatedGuard)
     @Get('getLeaderboard')
    async getLeaderboard(
     @Req() request,
    ) : Promise<User[]>
    {
      return this.statsServ.getLeaderboard();
    }
}


