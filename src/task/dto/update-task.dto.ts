import {PartialType, PickType} from '@nestjs/mapped-types';
import {CreateTaskDto} from './create-task.dto';
import {Optional} from '@nestjs/common';


export class UpdateTaskDto extends PartialType(PickType(CreateTaskDto, ['taskDeadline', 'taskDescription', 'taskProgress'] as const)) { }
