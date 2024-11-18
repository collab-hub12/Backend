import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsEmail} from 'class-validator';

export class LoginUserDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsString()
  password: string;
}
