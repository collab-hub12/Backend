import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Request } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/common/decorator/user.decorator';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invitations for a user' })
  @Get()
  getInvitation(@Req() req: Request) {
    return this.invitationsService.getAllInvites(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to an invitation' })
  @Post('/:invitation_id/accept')
  async respondToInvitation(
    @User() authUser: Express.User,
    @Param('invitation_id') invitation_id: string,
  ) {
    try {
      return await this.invitationsService.acceptInvitation(
        authUser.id,
        invitation_id,
      );
    } catch (error) {
      throw new HttpException(
        'Not Authorized to accept invitation',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
