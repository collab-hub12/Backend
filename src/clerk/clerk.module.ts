import {Module} from '@nestjs/common';
import {clerkProvider} from './clerk.provider';

@Module({
    providers: [...clerkProvider]
})
export class ClerkModule { }