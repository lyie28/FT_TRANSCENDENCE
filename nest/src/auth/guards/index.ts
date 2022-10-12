import { CanActivate, ExecutionContext, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

/*laura*/
@Injectable()
/*calls Intra strategy class*/
export class IntraAuthGuard extends AuthGuard('intra-oauth') {
    async canActivate(context: ExecutionContext): Promise<any> {
        if (context.getArgByIndex(0).query.error=== 'access_denied')
        {
          const response = context.switchToHttp().getResponse<Response>();
          response.redirect('http://localhost:4200/Denied');
          return false;
        }
        const activate = (await super.canActivate(context)) as boolean;
        /*get request object*/
        const request = context.switchToHttp().getRequest();
        /*print out request in console*/
        /*call logIn function with request*/
        await super.logIn(request);
        return activate;
    }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    /*returns boolean if authenticated or not*/
    return req.isAuthenticated();
    }
}

@Catch(ForbiddenException)
export class redirToLogin implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    response.redirect('http://localhost:4200');
  }
}
