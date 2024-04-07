import {IsNumber} from "class-validator";

export class AssignTaskDto {
    @IsNumber()
    assignee_id: number;
}
