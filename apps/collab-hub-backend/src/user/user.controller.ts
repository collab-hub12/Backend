import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a user' })
  @Public()
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'search',
    description: 'Search for a user',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
  })
  @ApiQuery({
    name: 'per_page',
    description: 'Number of elements per page',
    required: false,
  })
  @Get()
  async getUsers(
    @Query('search') search_text?: string,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
  ) {
    const offset = (page - 1) * per_page;
    const limit = per_page;
    return this.userService.getAllUser(search_text, offset, limit);
  }
}
