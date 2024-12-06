import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Request } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

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
  @Post('/accept')
  async respondToInvitation(
    @Req() req: Request,
    @Query('org_id') org_id: number,
    @Query('invitation_id') invitation_id: number,
  ) {
    return this.invitationsService.acceptInvitation(
      req.user.id,
      org_id,
      invitation_id,
    );
  }
}
