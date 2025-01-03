import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsString} from "class-validator";

export class verifyOTPDTO {
    @ApiProperty()
    @IsString()
    @IsEmail()
    email: string;
    @ApiProperty()
    @IsString()
    otp: string;
}
