import {Module} from '@nestjs/common';
import {RoomService} from './room.service';
import {RoomController} from './room.controller';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';

@Module({
  controllers: [RoomController],
  providers: [RoomService, ...drizzleProvider],
})
export class RoomModule { }
