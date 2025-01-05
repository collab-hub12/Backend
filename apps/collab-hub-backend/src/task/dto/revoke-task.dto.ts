import {ApiProperty} from '@nestjs/swagger';
import {IsNumber} from 'class-validator';

export class RevokeTaskDto {
  @ApiProperty()
  @IsNumber()
  revoke_from: string;
}
