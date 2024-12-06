import {Body, Controller, Get, Param, Post, Query, SetMetadata} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto, InvitationDto} from './dto/user.dto';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags} from '@nestjs/swagger';
import {Public} from 'src/decorator/public.decorator';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({summary: 'Create a user'})
  @Public()
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({summary: 'Get all users'})
  @ApiQuery({
    name: 'search',
    description: 'Search for a user',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset for pagination',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit for pagination',
    required: false,
  })
  @Get()
  async getUsers(
    @Query('search') search_text?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userService.getAllUser(search_text, offset, limit);
  }

  @ApiBearerAuth()
  @ApiOperation({summary: 'Get all tasks for a user'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @ApiQuery({
    name: 'offset',
    description: 'Offset for pagination',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit for pagination',
    required: false,
  })
  @Get(':user_id/tasks')
  async getUserTasks(
    @Param('user_id') user_id: number,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userService.getUserTasks(user_id, offset, limit);
  }
}
