import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthenticatedGuard } from "src/auth/guards";
import { Games } from "src/typeorm";
import { Repository } from "typeorm";

@Controller('game')
export class GameController {
    constructor(@InjectRepository(Games) private gameRepo:Repository<Games>) {}
   
    @UseGuards(AuthenticatedGuard)
    @Get('currentGame')
    async getCurrentGame( @Req() request) : Promise<Games[]> {
     const current = await this.gameRepo.find({relations: ["userLeft", "userRight"], where: {finish: false}});
     return current;
    }
}