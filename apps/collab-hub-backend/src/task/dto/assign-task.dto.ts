import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty()
  @IsString()
  assign_to: string;
}
