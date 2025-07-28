import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {
    const connection = amqp.connect([
      configService.get<string>('RABBIT_MQ_CONNECTION_URL'),
    ]);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue(this.configService.get<string>('QUEUE'), {
          durable: true,
        });
      },
    });
  }

  async PublishToQueue(message: any) {
    try {
      await this.channelWrapper.sendToQueue(
        this.configService.get<string>('QUEUE'),
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        },
      );
      Logger.log('Notification sent To queu ', JSON.stringify(message));
    } catch (error) {
      throw new HttpException(
        'Error publishing notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
