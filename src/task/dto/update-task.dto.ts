import {CreateTaskDto} from './create-task.dto';
import {IsNumber, IsOptional} from 'class-validator';
import {ApiProperty, PartialType, PickType} from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(
  PickType(CreateTaskDto, [
    'taskDeadline',
    'taskDescription',
    'taskProgress',
  ] as const),
) {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  position?: number;
}
