import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { DrawingboardService } from 'src/drawingboard/drawingboard.service';
import { drizzleProvider } from 'src/drizzle/drizzle.provider';

@Module({
  providers: [...drizzleProvider, DrawingboardService, SocketGateway],
})
export class SocketModule {}
