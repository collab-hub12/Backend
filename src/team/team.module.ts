import {Module} from '@nestjs/common';
import {TeamService} from './team.service';
import {TeamController} from './team.controller';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';

@Module({
  providers: [TeamService, ...drizzleProvider],
  controllers: [TeamController]
})
export class TeamModule { }
