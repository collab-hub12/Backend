import { IsNumber, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  title: string;
  @IsNumber()
  org_id: number;
  @IsNumber()
  team_id: number;
  @IsString()
  room_agenda: string;
}
