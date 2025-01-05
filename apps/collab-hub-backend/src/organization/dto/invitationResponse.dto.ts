import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsNumber, IsString} from 'class-validator';

export class InvitationResponseDto {
  @ApiProperty()
  @IsString()
  org_Id: string;
  @ApiProperty()
  @IsBoolean()
  acceptInvitation: string;
}
