import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { env } from 'src/utils/env';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // For some stupid, unknown reason, getRequest does not return the request, but getNext does (kind of).
        const authHeader = context.switchToHttp().getNext().req.headers.authorization as string;
        return authHeader === env.API_KEY;
    }
}
