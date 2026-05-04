import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

const DEV_USER = {
  sub: 'f7d7a53c-62de-4f55-9b5e-80170dd84acd',
  name: 'Dev User',
  email: 'dev@example.com',
  picture: 'https://img.example.com/avatar.jpg',
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Inject(Reflector) private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const hasToken = !!request.headers.authorization;

    if (process.env.NODE_ENV === 'development' && !hasToken) {
      request.user = DEV_USER;
      return true;
    }

    const result = await super.canActivate(context);
    return result as boolean;
  }
}
