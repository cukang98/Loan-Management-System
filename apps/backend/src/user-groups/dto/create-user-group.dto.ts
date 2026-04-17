import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionItemDto {
  @IsString()
  @IsIn(['loans', 'customers', 'lenders', 'repayments', 'users', 'user-groups'])
  module: string;

  @IsString()
  @IsIn(['create', 'read', 'update', 'delete'])
  action: string;
}

export class CreateUserGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  permissions?: PermissionItemDto[];
}
