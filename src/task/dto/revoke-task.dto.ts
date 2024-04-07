import {IsNumber} from "class-validator";

export class RevokeTaskDto {
    @IsNumber()
    revoked_from: number;
}