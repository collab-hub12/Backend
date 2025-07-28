import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { and, eq, lte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Response } from 'express';
import { cookieConfig } from 'src/common/constants/cookies';
import { DrizzleAsyncProvider } from '@app/drizzle/drizzle.provider';
import { refreshTokens } from '@app/drizzle/schemas/refreshtoken';
import { schema } from '@app/drizzle/schemas/schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthRefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
  ) {}

  async generateRefreshToken(
    authUser: Express.User,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    const newRefreshToken = this.jwtService.sign(
      { sub: authUser.id },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    if (currentRefreshToken && currentRefreshTokenExpiresAt) {
      const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(currentRefreshToken)
        .digest('base64');

      if (
        await this.isRefreshTokenBlackListed(hashedRefreshToken, authUser.id)
      ) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      await this.db.insert(refreshTokens).values({
        refreshToken: hashedRefreshToken,
        expiresAt: currentRefreshTokenExpiresAt.toISOString(),
        userId: authUser.id,
      });
    }

    return newRefreshToken;
  }

  private async isRefreshTokenBlackListed(
    hashedRefreshToken: string,
    userId: string,
  ) {
    const refreshToken = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.refreshToken, hashedRefreshToken),
          eq(refreshTokens.userId, userId),
        ),
      );
    return refreshToken.length > 0;
  }

  async generateTokenPair(
    user: Express.User,
    res: Response,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    const payload = { sub: user.id };

    res.cookie(
      cookieConfig.refreshToken.name,
      await this.generateRefreshToken(
        user,
        currentRefreshToken,
        currentRefreshTokenExpiresAt,
      ),
      {
        ...cookieConfig.refreshToken.options,
      },
    );

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
      }),
    };
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async clearExpiredRefreshTokens() {
    await this.db
      .delete(refreshTokens)
      .where(lte(refreshTokens.expiresAt, new Date().toISOString()));
  }
}
