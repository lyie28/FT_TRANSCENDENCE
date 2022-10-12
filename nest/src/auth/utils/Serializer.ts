import { PassportSerializer } from "@nestjs/passport";
import { Injectable, Inject } from '@nestjs/common';
import { User } from "../../typeorm";
import { Done } from "./types";
import { AuthenticationProvider } from "../services/auth/auth";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthenticationProvider,
    ){
        super();
    }

    serializeUser(user: User, done: Done) {
        done(null, user);
    }

    async deserializeUser(user: User, done: Done) {
        /*search for user in database,
        if found returns user, else returns NULL*/
        const userDb = await this.authService.findUser(user.intraId);
        return userDb ? done(null, userDb) : done(null, null);
    }
}