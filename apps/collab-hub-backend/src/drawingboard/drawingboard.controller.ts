import { Controller } from '@nestjs/common';
import { DrawingboardService } from './drawingboard.service';

@Controller('drawingboard')
export class DrawingboardController {
  constructor(private readonly drawingboardService: DrawingboardService) {}
}
