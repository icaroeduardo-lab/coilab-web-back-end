import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

const DEV_USER = {
  sub: 'f7d7a53c-62de-4f55-9b5e-80170dd84acd',
};

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
