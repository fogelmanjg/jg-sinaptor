import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [KafkaConsumerService],
})
export class KafkaModule {}
