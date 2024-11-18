import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum ProgressState {
  InProgress = 'InProgress',
  Done = 'Done',
  NotStarted = 'NotStarted',
  InReview = 'InReview',
}

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  taskTitle: string;
  @ApiProperty()
  @IsString()
  taskDescription: string;
  @ApiProperty()
  @IsEnum(ProgressState)
  taskProgress: ProgressState;
  @ApiProperty()
  @IsString()
  taskDeadline: string;
}

export class UpdateTaskDto {
  @ApiProperty()
  @IsString()
  taskDescription?: string;
  @ApiProperty()
  @IsEnum(ProgressState)
  taskProgress?: ProgressState;
  @ApiProperty()
  @IsString()
  taskDeadline?: string;
}
