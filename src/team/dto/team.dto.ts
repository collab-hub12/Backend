import { IsNumber, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  team_name: string;
  @IsNumber()
  org_id: number;
}
