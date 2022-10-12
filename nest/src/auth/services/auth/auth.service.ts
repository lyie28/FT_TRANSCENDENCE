/* samantha, laura */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../typeorm';
import { UserDetails } from '../../utils/types';
import { AuthenticationProvider } from './auth';
import { MailerService } from '@nestjs-modules/mailer';
import { ChatGateway } from 'src/chat/chat.gateway';


@Injectable()
export class AuthService implements AuthenticationProvider {
    constructor(@InjectRepository(User) private userRepo: Repository<User>, private mailerService: MailerService, private ChatGateway: ChatGateway ) { }

    async validateUser(details: UserDetails) { //en parametre se trouve les information de l' utilisateur donnees par IntraAtrategy
        const { intraId } = details;
        const user = await this.userRepo.findOne({ where: { intraId} }); //on cherche un utilisateur qui correspond aux infos envoye en parametre
        if (user)
        {
          if (user.twoFA === true && user.isConnected === false) //s' il y en a un et que son statut n' est pas verifier, on envoie le code par mail pour verification et on update le code dans la db aussi
          {
            const myNewCode = Math.floor(10000 + Math.random() * 90000);
            this.sendCode(user, myNewCode);
            await this.userRepo.update( { id: user.id}, {authConfirmToken:myNewCode});
          }
          else
          {
            await this.userRepo.update( { id: user.id}, {isConnected:true});
          }
          return user;// on retourne le user modifie
        }
        const newUser = await this.createUser(details); // sinon c' est que l' utilisateur n' existe pas dans la base de donne, donc on le cree et le renvoie
        return (newUser);
    }

    createUser(details: UserDetails){ //creation d' un nouvel utilisateur
        const user = this.userRepo.create(details);
        return this.userRepo.save(user);
    };

    findUser(intraId: string){ // getter, vraiment utile ?
        return this.userRepo.findOne( { where: { intraId } } );
    };

    async sendCode(user: User, newCode: Number) { // fonction qui permet d'envoyer le mail avec le code de verification
    await this.mailerService.sendMail({
        to: user.email, // get l' email de l'utilisateur
        subject: 'Your transcendence secret code !', 
        template: 'confirm',
        context: {
          login: user.login, //dans nest/views/email-templates/confirm.hbs, login et code seront remplace par les donne de l'utilisateur
          code: newCode
        },
      });
    }

}