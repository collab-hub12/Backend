import {PartialType, PickType} from '@nestjs/mapped-types';
import {CreateTaskDto} from './create-task.dto';
import {IsNumber, IsOptional} from 'class-validator';

export class UpdateTaskDto extends PartialType(
  PickType(CreateTaskDto, [
    'taskDeadline',
    'taskDescription',
    'taskProgress',
  ] as const),
) {
  @IsOptional()
  @IsNumber()
  position?: number;
}
