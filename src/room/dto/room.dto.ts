import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsNumber()
  org_id: number;
  @ApiProperty()
  @IsNumber()
  team_id: number;
  @ApiProperty()
  @IsString()
  room_agenda: string;
}
