import {Module} from '@nestjs/common';
import {SocketGateway} from './socket.gateway';
import {DrawingboardModule} from 'src/drawingboard/drawingboard.module';

@Module({
  imports: [DrawingboardModule],
  providers: [SocketGateway],
})
export class SocketModule { }
