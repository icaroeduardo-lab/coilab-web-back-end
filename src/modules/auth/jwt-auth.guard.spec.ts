import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

const makeContext = (handlerMeta: unknown, classMeta: unknown): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({}) }),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('returns true for @Public() routes without calling super', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const ctx = makeContext(null, null);
    const result = guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('delegates to AuthGuard when route is not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true);
    const ctx = makeContext(null, null);
    guard.canActivate(ctx);
    expect(superCanActivate).toHaveBeenCalledWith(ctx);
  });

  it('checks IS_PUBLIC_KEY on handler and class', () => {
    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = makeContext(null, null);
    jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true);
    guard.canActivate(ctx);
    expect(spy).toHaveBeenCalledWith(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
  });
});
