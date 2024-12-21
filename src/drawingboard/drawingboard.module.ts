import { Module } from '@nestjs/common';
import { DrawingboardService } from './drawingboard.service';
import { DrawingboardController } from './drawingboard.controller';

@Module({
  controllers: [DrawingboardController],
  providers: [DrawingboardService],
  exports: [DrawingboardService],
})
export class DrawingboardModule {}
