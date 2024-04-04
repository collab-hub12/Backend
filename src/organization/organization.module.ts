import {Module} from '@nestjs/common';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, ...drizzleProvider]
})
export class OrganizationModule { }
