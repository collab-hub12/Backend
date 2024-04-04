import {IsEmail, IsString} from "class-validator";

export class CreateOrgDto {
    @IsString()
    org_name: string;
    @IsString()
    org_desc: string;
    @IsString()
    location: string;
}