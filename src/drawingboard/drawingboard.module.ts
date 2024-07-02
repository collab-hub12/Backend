import { Module } from '@nestjs/common';
import { DrawingboardService } from './drawingboard.service';
import { DrawingboardController } from './drawingboard.controller';
import { drizzleProvider } from 'src/drizzle/drizzle.provider';

@Module({
  controllers: [DrawingboardController],
  providers: [DrawingboardService, ...drizzleProvider],
})
export class DrawingboardModule {}
