import { Module } from '@nestjs/common';
import { GatewayPublisherService } from './gateway-publisher.service';

@Module({
  providers: [GatewayPublisherService],
  exports: [GatewayPublisherService],
})
export class GatewayModule {}
