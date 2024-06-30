import { Test, TestingModule } from '@nestjs/testing';
import { DrawingboardService } from './drawingboard.service';

describe('DrawingboardService', () => {
  let service: DrawingboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrawingboardService],
    }).compile();

    service = module.get<DrawingboardService>(DrawingboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
