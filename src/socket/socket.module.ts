import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { DrawingboardService } from 'src/drawingboard/drawingboard.service';

@Module({
  providers: [DrawingboardService, SocketGateway],
})
export class SocketModule {}
