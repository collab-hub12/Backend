import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);

  constructor(private readonly configService: ConfigService) {
    const connection = amqp.connect([
      configService.get<string>('RABBIT_MQ_CONNECTION_URL'),
    ]);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(this.configService.get<string>('QUEUE'), {
          durable: true,
        });
        await channel.consume(
          this.configService.get<string>('QUEUE'),
          async (message) => {
            if (message) {
              const content = JSON.parse(message.content.toString());
              this.logger.log('Received message:', content);

              channel.ack(message);
            }
          },
        );
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }
}
