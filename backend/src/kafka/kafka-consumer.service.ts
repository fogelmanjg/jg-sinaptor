import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { EventsService } from '../events/events.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly eventsService: EventsService,
  ) {}

  async onModuleInit() {
    const brokers = this.config.get<string[]>('kafka.brokers')!;
    const clientId = this.config.get<string>('kafka.clientId')!;
    const groupId = this.config.get<string>('kafka.groupId')!;
    const topics = this.config.get<string[]>('kafka.topics')!;

    const kafka = new Kafka({ clientId, brokers, retry: { initialRetryTime: 1000, retries: 10 } });
    this.consumer = kafka.consumer({ groupId });

    try {
      await this.consumer.connect();
      this.logger.log(`Connected to Kafka brokers: ${brokers.join(', ')}`);

      const lastOffsets = await this.eventsService.getLastOffsets();

      await this.consumer.subscribe({ topics, fromBeginning: true });
      this.logger.log(`Subscribed to topics: ${topics.join(', ')}`);

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.handleMessage(topic, partition, message);
        },
      });

      for (const [topic, partitions] of lastOffsets) {
        for (const [partition, offset] of partitions) {
          this.consumer.seek({ topic, partition, offset: String(offset + 1) });
          this.logger.debug(`Resumed ${topic}:${partition} from offset ${offset + 1}`);
        }
      }

      this.logger.log('Kafka consumer running');
    } catch (err: unknown) {
      this.logger.error(`Kafka connection failed: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.consumer?.disconnect();
    this.logger.log('Kafka consumer disconnected');
  }

  private async handleMessage(
    topic: string,
    partition: number,
    message: { value: Buffer | null; offset: string },
  ) {
    if (!message.value) {
      this.logger.warn(`Empty message on ${topic}:${partition}:${message.offset}`);
      return;
    }
    try {
      const event = JSON.parse(message.value.toString()) as Record<string, unknown>;
      await this.eventsService.saveAndBroadcast(event, topic, partition, Number(message.offset));
    } catch (err: unknown) {
      this.logger.error(`Error processing ${topic}:${partition}:${message.offset}: ${(err as Error).message}`);
    }
  }
}
