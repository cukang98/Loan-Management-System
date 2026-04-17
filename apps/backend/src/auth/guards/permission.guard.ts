import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, RequiredPermission } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    if (user.userGroup?.isSuperAdmin) return true;

    const hasPermission = user.userGroup?.permissions?.some(
      (p: { module: string; action: string }) =>
        p.module === required.module && p.action === required.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permission denied: requires ${required.module}:${required.action}`,
      );
    }

    return true;
  }
}
