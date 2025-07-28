import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RevokeTaskDto {
  @ApiProperty()
  @IsString()
  revoke_from: string;
}
