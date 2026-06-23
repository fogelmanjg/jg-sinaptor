import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const brokers = this.config.get<string[]>('kafka.brokers')!;
    const clientId = `${this.config.get<string>('kafka.clientId')!}-producer`;
    const kafka = new Kafka({ clientId, brokers, retry: { initialRetryTime: 2000, retries: 15 } });
    this.producer = kafka.producer();
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
  }

  async publish(topic: string, event: Record<string, unknown>): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ key: String(event['id']), value: JSON.stringify(event) }],
    });
    this.logger.debug(`Published ${event['eventType']} to ${topic}`);
  }
}
