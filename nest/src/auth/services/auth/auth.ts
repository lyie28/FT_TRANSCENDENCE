import { UserDetails } from "src/auth/utils/types";
import { User } from "src/typeorm";

export interface AuthenticationProvider { //interface, pernmet de simplifier l'accessibilite depuis d'autre fichie
    validateUser(details: UserDetails);
    createUser(details: UserDetails);
    findUser(intraId: string) : Promise<User> | undefined;
}