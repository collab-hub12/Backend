import {Module, DynamicModule} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import Redis from 'ioredis';


@Module({})
export class RedisModule {
    static forRootAsync(): DynamicModule {
        return {
            module: RedisModule,
            providers: [
                {
                    inject: [ConfigService],
                    provide: 'REDIS_CLIENT',
                    useFactory: async (configService: ConfigService) => {
                        const redisClient = new Redis(configService.get("REDIS_URL"));

                        redisClient.on('error', (err) => {
                            console.error('Redis Client Error', err);
                        });

                        return redisClient;
                    },
                },
            ],
            exports: ['REDIS_CLIENT'],
        };
    }
}
