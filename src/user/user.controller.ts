import {Body, Controller, Get, Param, Post, Query, Req} from '@nestjs/common';
import {UserService} from './user.service';
import {IGetUserAuthInfoRequest} from 'src/auth/auth.controller';
import {InvitationDto} from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async getUsers(
    @Query('search') search_text?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userService.getAllUser(search_text, offset, limit);
  }

  @Get(":user_id/invitations")
  async getOrgInvitations(
    @Param("user_id") user_id: number,
  ) {
    return this.userService.getInvitaions(user_id)
  }

  @Post(":user_id/invitations")
  async respondToInvitation(
    @Param("user_id") user_id: number,
    @Body() dto: InvitationDto
  ) {
    return this.userService.respondToInvitaion(dto.status, user_id, dto.org_id)
  }

  @Get(":user_id/tasks")
  async getUserTasks(
    @Param("user_id") user_id: number,
    @Query("offset") offset?: number,
    @Query("limit") limit?: number,
  ) {
    return this.userService.getUserTasks(user_id, offset, limit)
  }

}
