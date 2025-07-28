import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class verifyOTPDTO {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsString()
  otp: string;
}

export class InvitationQueryFilter {
  @IsOptional()
  @IsString()
  invitation: string;
}
