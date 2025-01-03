
import {HttpException, HttpStatus, Inject, Injectable} from "@nestjs/common";
import * as crypto from "crypto"
import {compare, hash} from "bcrypt";
import {Redis} from "ioredis";
import {MailService} from "@app/mailer/mailer.service";

@Injectable()
export class OTPService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
        private readonly mailService: MailService
    ) { }

    private readonly OTP_EXPIRATION_TIME = 5 * 60; // 5 minutes
    private readonly MAX_RETRY_COUNT = 5;
    private readonly SHORT_COOLDOWN_TIME = 60;
    private readonly LONG_COOLDOWN_TIME = 3600;

    getRandomSixDigit() {
        return crypto.randomInt(100000, 1000000) // Ensure it's a 6-digit number
    }

    // Store OTP and initialize retry count
    async storeOtp(email: string, otp: string): Promise<void> {
        await this.redisClient.set(`otp:${email}`, otp, "EX", this.OTP_EXPIRATION_TIME);
        await this.redisClient.set(`otp_retry_count:${email}`, 0, "EX", this.OTP_EXPIRATION_TIME);
    }

    // Apply cooldown (1 minute or 1 hour)
    async applyCooldown(email: string, cooldownTime: number): Promise<void> {
        const currentTime = Math.floor(Date.now() / 1000);
        await this.redisClient.set(`otp_cooldown:${email}`, (currentTime + cooldownTime).toString(), "EX", cooldownTime);
    }

    // Check if user is on cooldown
    async isOnCooldown(email: string) {
        const currentTime = Math.floor(Date.now() / 1000);
        const cooldownTimestamp = await this.redisClient.get(`otp_cooldown:${email}`);

        if (cooldownTimestamp && currentTime < Number(cooldownTimestamp)) {
            const timeLeft = Number(cooldownTimestamp) - currentTime;
            const minutesLeft = Math.floor(timeLeft / 60);
            const secondsLeft = timeLeft % 60;

            throw new HttpException(
                `OTP request is on cooldown. Please wait ${minutesLeft} minutes and ${secondsLeft} seconds.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    // Handle OTP request
    async requestOTP(email: string, name?: string) {

        await this.isOnCooldown(email);

        const otp = this.getRandomSixDigit().toString()

        const hashedOtp = await hash(otp, 10);

        await this.storeOtp(email, hashedOtp);

        await this.applyCooldown(email, this.SHORT_COOLDOWN_TIME);

        await this.mailService.sendOTP(email, name, otp);
    }

    async verifyOTP(email: string, otp: string) {

        const storedHashedOtp = await this.redisClient.get(`otp:${email}`);

        const retryCount = Number(await this.redisClient.get(`otp_retry_count:${email}`)) || 0;

        if (retryCount >= this.MAX_RETRY_COUNT) {
            throw new HttpException(
                'Maximum retry attempts reached',
                HttpStatus.FORBIDDEN
            );
        }

        const isverified = await compare(otp, storedHashedOtp);

        if (!isverified) {
            await this.redisClient.incr(`otp_retry_count:${email}`);

            // If retry count reaches max, set 1-hour cooldown
            if (retryCount + 1 >= this.MAX_RETRY_COUNT) {
                await this.applyCooldown(email, this.LONG_COOLDOWN_TIME);
            }

            throw new HttpException('Invalid OTP', HttpStatus.FORBIDDEN);
        }
    }

}