import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';

export class CreateOrgDto {
  @ApiProperty()
  @IsString()
  org_name: string;
  @ApiProperty()
  @IsString()
  org_desc: string;
  @ApiProperty()
  @IsString()
  location: string;
}

export class AddUserToOrgDto {
  @ApiProperty()
  @IsString()
  user_email: string;
}

export class AddUserToTeamDto {
  @ApiProperty()
  @IsString()
  user_id: string;
}

export class CreateTeamUnderOrgDto {
  @ApiProperty()
  @IsString()
  team_name: string;
}
