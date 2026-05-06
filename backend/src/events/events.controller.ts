import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventFiltersDto } from './events.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findByRange(@Query() filters: EventFiltersDto) {
    return this.eventsService.findByRange(filters);
  }

  @Get('stats')
  getStats() {
    return this.eventsService.getStats();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }
}
