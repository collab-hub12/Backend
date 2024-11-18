import {ApiProperty} from "@nestjs/swagger";
import {IsBoolean, IsNumber} from "class-validator";


export class InvitationResponseDto {
    @ApiProperty()
    @IsNumber()
    org_Id: number;
    @ApiProperty()
    @IsBoolean()
    acceptInvitation: string;
}