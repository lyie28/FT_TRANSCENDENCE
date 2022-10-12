/*laura*/
import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { AuthenticationProvider } from '../services/auth/auth';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
/*IntraStrategy class provided to auth module for use*/
export class IntraStrategy extends PassportStrategy(Strategy, 'intra-oauth')
{
    /*we inject functions from auth.service.ts via auth_module*/
constructor(private httpService: HttpService, @Inject('AUTH_SERVICE') private readonly authService: AuthenticationProvider,
) {
    
    super({
        /*call super with correct API details to launch API login in browser*/
        authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
        tokenURL: 'https://api.intra.42.fr/oauth/token',
        clientID: process.env.INTRA_CLIENT_ID,
        clientSecret: process.env.INTRA_CLIENT_SECRET,
        callbackURL: process.env.INTRA_CALLBACK_URL,
    });
}

async validate(accessToken: string) {
    /*Access token issued by Intra login is recovered and can be used to access Intra profile info*/
    ///recover profile details from intra via get request with our access token
    // need to use lastValueFrom because it doesn't work if not, this converts an Observable to a Promise. For more info: https://rxjs.dev/api/index/function/lastValueFrom
    const { data } = await lastValueFrom(this.httpService.get('https://api.intra.42.fr/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
})) ;
    
    //create an object to hold values recovered from Intra
    const details = {
        login: data.login,
        intraId: data.id,
        avatar: data.image_url,
        email: data.email,
        authConfirmToken: undefined,
        isConnected: true };
 
    //send them to validate function which will return user created with them
    return this.authService.validateUser(details);
}
}