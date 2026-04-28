import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

const makeContext = (headers: any = {}): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
      }),
    }),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
    process.env.NODE_ENV = 'test';
  });

  it('returns true for @Public() routes without calling super', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const ctx = makeContext();
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('delegates to AuthGuard when route is not public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockResolvedValue(true);
    const ctx = makeContext({ authorization: 'Bearer token' });
    await guard.canActivate(ctx);
    expect(superCanActivate).toHaveBeenCalledWith(ctx);
  });

  it('checks IS_PUBLIC_KEY on handler and class', async () => {
    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = makeContext({ authorization: 'Bearer token' });
    jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockResolvedValue(true);
    await guard.canActivate(ctx);
    expect(spy).toHaveBeenCalledWith(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
  });

  it('injects DEV_USER in development when no token is present', async () => {
    process.env.NODE_ENV = 'development';
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const request = { headers: {} } as any;
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(request.user).toBeDefined();
    expect(request.user.name).toBe('Dev User');
    process.env.NODE_ENV = 'test';
  });
});
