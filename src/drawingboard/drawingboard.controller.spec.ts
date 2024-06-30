import { Test, TestingModule } from '@nestjs/testing';
import { DrawingboardController } from './drawingboard.controller';
import { DrawingboardService } from './drawingboard.service';

describe('DrawingboardController', () => {
  let controller: DrawingboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrawingboardController],
      providers: [DrawingboardService],
    }).compile();

    controller = module.get<DrawingboardController>(DrawingboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
