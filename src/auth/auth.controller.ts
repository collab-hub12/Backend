import {Controller, Get} from '@nestjs/common';
import {AuthService} from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Get()
    allusers(): any {
        return this.authService.getusers();
    }
}
