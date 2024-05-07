import {IsNumber, IsString} from "class-validator";

export class CreateOrgDto {
    @IsString()
    org_name: string;
    @IsString()
    org_desc: string;
    @IsString()
    location: string;
}

export class AddUserToOrgDto {
    @IsNumber()
    user_id: number;
}

export class CreateTeamUnderOrgDto {
    @IsString()
    team_name: string;
}