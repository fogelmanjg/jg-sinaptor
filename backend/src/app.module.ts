import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { EventsModule } from './events/events.module';
import { KafkaModule } from './kafka/kafka.module';
import { IngestModule } from './ingest/ingest.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({ uri: cs.get<string>('mongodb.uri') }),
    }),
    EventsModule,
    KafkaModule,
    IngestModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
