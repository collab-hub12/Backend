import {IsEmail, IsNumber, IsString} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  picture: string;
}

export class InvitationDto {
  @IsNumber()
  org_id: number;
  @IsNumber()
  user_id: number;
  @IsString()
  status: string;
}