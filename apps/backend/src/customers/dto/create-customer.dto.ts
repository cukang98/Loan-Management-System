import { IsString, IsEmail, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

const emptyToUndefined = () => Transform(({ value }) => value === '' ? undefined : value);

export class CreateCustomerDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @emptyToUndefined()
  @IsOptional()
  @IsEmail()
  email?: string;

  @emptyToUndefined()
  @IsOptional()
  @IsString()
  address?: string;

  @emptyToUndefined()
  @IsOptional()
  @IsString()
  notes?: string;
}
