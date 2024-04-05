import {IsEnum, IsString} from "class-validator";

export enum ProgressState {
    InProgress = 'InProgress',
    Done = 'Done',
    NotStarted = 'NotStarted',
    InReview = 'InReview'
}

export class CreateTaskDto {
    @IsString()
    taskTitle: string;
    @IsString()
    taskDescription: string;
    @IsEnum(ProgressState)
    taskProgress: ProgressState;
    @IsString()
    taskDeadline: string;
}
