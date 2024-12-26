import {
    Controller,
    Post,
    Body,
    Param,
    Get,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import {OrganizationService} from '../organization.service';
import {Roles} from 'src/common/decorator/roles.decorator';
import {Role} from 'src/enum/role.enum';
import {RolesGuard} from 'src/auth/guards/role.guard';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import {CreateTaskDto} from 'src/task/dto/create-task.dto';
import {UpdateTaskDto} from 'src/task/dto/update-task.dto';
import {ParseUserIdsPipe} from 'src/common/pipes/userIDpipe';
import {AssignTaskDto} from 'src/task/dto/assign-task.dto';
import {RevokeTaskDto} from 'src/task/dto/revoke-task.dto';

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('orgs')
export class OrganizationTaskController {
    constructor(private readonly orgService: OrganizationService) { }

    //********************----TASK-RELATED-QUERIES----*************************//

    @ApiOperation({summary: 'Create a task'})
    @ApiParam({name: 'org_id', description: 'Organization ID'})
    @ApiParam({name: 'team_id', description: 'Team ID'})
    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @UseGuards(RolesGuard)
    @Post(':org_id/teams/:team_id/tasks')
    async createTask(
        @Param('org_id') org_id: number,
        @Param('team_id') team_id: number,
        @Body() createTaskDto: CreateTaskDto,
    ) {
        return this.orgService.createTask(org_id, team_id, createTaskDto);
    }

    @ApiOperation({summary: 'Update a task'})
    @ApiParam({name: 'org_id', description: 'Organization ID'})
    @ApiParam({name: 'team_id', description: 'Team ID'})
    @ApiParam({name: 'task_id', description: 'Task ID'})
    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @UseGuards(RolesGuard)
    @Put(':org_id/teams/:team_id/tasks/:task_id')
    async UpdateTask(
        @Param('org_id') org_id: number,
        @Param('team_id') team_id: number,
        @Param('task_id') task_id: number,
        @Body() updatetaskDto: UpdateTaskDto,
    ) {
        return this.orgService.updateTask(org_id, team_id, task_id, updatetaskDto);
    }

    @ApiOperation({summary: 'Get all tasks of a team'})
    @ApiParam({name: 'org_id', description: 'Organization ID'})
    @ApiParam({name: 'team_id', description: 'Team ID'})
    @ApiQuery({name: 'user_ids', description: 'User IDs', required: false})
    @Get(':org_id/teams/:team_id/tasks')
    async getTasks(
        @Param('org_id') org_id: number,
        @Param('team_id') team_id: number,
        @Query('user_ids', ParseUserIdsPipe) userIDs?: number[]
    ) {
        return this.orgService.getTasks(org_id, team_id, userIDs);
    }

    @ApiOperation({summary: 'Get a task by id'})
    @ApiParam({name: 'org_id', description: 'Organization ID'})
    @ApiParam({name: 'team_id', description: 'Team ID'})
    @ApiParam({name: 'task_id', description: 'Task ID'})
    @Get(':org_id/teams/:team_id/tasks/:task_id')
    async getTasksById(
        @Param('org_id') org_id: number,
        @Param('team_id') team_id: number,
        @Param('task_id') task_id: number,
    ) {
        return this.orgService.getTaskById(org_id, team_id, task_id);
    }

    @ApiOperation({summary: 'Assign a task to a user'})
    @ApiParam({name: 'org_id', description: 'Organization ID'})
    @ApiParam({name: 'team_id', description: 'Team ID'})
    @ApiParam({name: 'task_id', description: 'Task ID'})
    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @Put(':org_id/teams/:team_id/tasks/:task_id/assign')
    async assignTask(
        @Param('org_id') org_id: number,
        @Param('team_id') team_id: number,
        @Param('task_id') task_id: number,
        @Body() assigntaskdto: AssignTaskDto,
    ) {
        return this.orgService.assignTask(
            org_id,
            team_id,
            task_id,
            assigntaskdto.assign_to,
        );
    }

    @ApiOperation({summary: 'Revoke a task from a user'})
    @ApiParam({name: 'org_id', description: 'Organization ID'})
    @ApiParam({name: 'team_id', description: 'Team ID'})
    @ApiParam({name: 'task_id', description: 'Task ID'})
    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @Put(':org_id/teams/:team_id/tasks/:task_id/revoke')
    async revokeTask(
        @Param('org_id') org_id: number,
        @Param('team_id') team_id: number,
        @Param('task_id') task_id: number,
        @Body() revoketaskdto: RevokeTaskDto,
    ) {
        return this.orgService.revokeTask(
            org_id,
            team_id,
            task_id,
            revoketaskdto.revoke_from,
        );
    }
}