import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { KafkaProducerService } from './kafka-producer.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [KafkaConsumerService, KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
