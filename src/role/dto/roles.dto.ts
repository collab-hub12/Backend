import {IsNumber, IsOptional} from "class-validator";

export class GetRolesDto {
    @IsNumber()
    org_id: number;
    @IsOptional()
    @IsNumber()
    team_id?: number;
    @IsOptional()
    @IsNumber()
    room_id?: number;
}
