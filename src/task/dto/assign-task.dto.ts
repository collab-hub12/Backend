import {ApiProperty} from '@nestjs/swagger';
import {IsNumber} from 'class-validator';

export class AssignTaskDto {
  @ApiProperty()
  @IsNumber()
  assign_to: number;
}
