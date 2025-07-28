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
  title: string;
  @ApiProperty()
  @IsString()
  description: string;
  @ApiProperty()
  @IsEnum(ProgressState)
  progress: ProgressState;
  @ApiProperty()
  @IsString()
  deadline: string;
}
