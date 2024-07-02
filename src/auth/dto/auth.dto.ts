import { IsString, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
