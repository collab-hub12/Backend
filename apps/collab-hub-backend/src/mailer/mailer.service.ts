import {MailerService} from '@nestjs-modules/mailer';
import {Injectable} from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) { }

    async sendInvitation(email: string, name: string, url: string, organization: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Invitation to join organization',
            template: './invitation',
            context: {name, url, organization}
        })
    }

    async sendNotification(email: string, name: string, message: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Notification',
            template: './notification',
            context: {name, message}
        })
    }
}
