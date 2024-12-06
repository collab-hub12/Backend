import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNumber, IsString} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsString()
  picture: string;
  @ApiProperty()
  @IsString()
  password: string;
}

export class InvitationDto {
  @ApiProperty()
  @IsNumber()
  org_id: number;
}
