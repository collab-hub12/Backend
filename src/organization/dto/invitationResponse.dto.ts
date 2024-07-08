import {IsBoolean, IsNumber} from "class-validator";


export class InvitationResponseDto {
    @IsNumber()
    org_Id: number;
    @IsBoolean()
    acceptInvitation: string;
}