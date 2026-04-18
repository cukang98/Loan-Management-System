import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  userId: string;

  @IsString()
  @MinLength(6)
  password: string;
}
