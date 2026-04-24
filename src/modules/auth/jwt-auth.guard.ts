import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

const DEV_USER = { sub: 'dev-user-00000000-0000-0000-0000-000000000000', email: 'dev@coilab.local' };

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (process.env.NODE_ENV === 'development') {
      context.switchToHttp().getRequest().user = DEV_USER;
      return true;
    }

    return super.canActivate(context);
  }
}
