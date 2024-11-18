import {Body, Controller, Get, Param, Post, Query, Req} from '@nestjs/common';
import {UserService} from './user.service';
import {IGetUserAuthInfoRequest} from 'src/auth/auth.controller';
import {InvitationDto} from './dto/user.dto';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags} from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({summary: 'Get all users'})
  @ApiQuery({name: 'search', description: 'Search for a user', required: false})
  @ApiQuery({name: 'offset', description: 'Offset for pagination', required: false})
  @ApiQuery({name: 'limit', description: 'Limit for pagination', required: false})
  @Get()
  async getUsers(
    @Query('search') search_text?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userService.getAllUser(search_text, offset, limit);
  }

  @ApiOperation({summary: 'Get all invitations for a user'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @Get(":user_id/invitations")
  async getOrgInvitations(
    @Param("user_id") user_id: number,
  ) {
    return this.userService.getInvitaions(user_id)
  }

  @ApiOperation({summary: 'Respond to an invitation'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @Post(":user_id/invitations")
  async respondToInvitation(
    @Param("user_id") user_id: number,
    @Body() dto: InvitationDto
  ) {
    return this.userService.respondToInvitaion(dto.status, user_id, dto.org_id)
  }

  @ApiOperation({summary: 'Get all tasks for a user'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @ApiQuery({name: 'offset', description: 'Offset for pagination', required: false})
  @ApiQuery({name: 'limit', description: 'Limit for pagination', required: false})
  @Get(":user_id/tasks")
  async getUserTasks(
    @Param("user_id") user_id: number,
    @Query("offset") offset?: number,
    @Query("limit") limit?: number,
  ) {
    return this.userService.getUserTasks(user_id, offset, limit)
  }

}
