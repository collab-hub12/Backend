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
  @IsNumber()
  user_id: number;
}

export class CreateTeamUnderOrgDto {
  @ApiProperty()
  @IsString()
  team_name: string;
}
