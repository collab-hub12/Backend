import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  team_name: string;
  @ApiProperty()
  @IsString()
  org_id: string;
}
