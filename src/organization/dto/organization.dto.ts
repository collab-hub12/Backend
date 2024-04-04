import {IsNumber, IsString} from "class-validator";

export class CreateOrgDto {
    @IsString()
    org_name: string;
    @IsString()
    org_desc: string;
    @IsString()
    location: string;
    @IsNumber()
    founder_id: number;
}

export class AddUserToOrgDto {
    @IsNumber()
    user_id: number;
}