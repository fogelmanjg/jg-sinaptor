import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { EventFiltersDto, EventSummaryDto, EventDetailDto } from './events.dto';
import { GatewayPublisherService } from '../gateway/gateway-publisher.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    private readonly gatewayPublisher: GatewayPublisherService,
  ) {}

  async saveAndBroadcast(
    event: Record<string, unknown>,
    topic: string,
    partition: number,
    offset: number,
  ): Promise<EventDocument | null> {
    try {
      const doc = new this.eventModel({
        eventId: event['id'],
        eventType: event['eventType'],
        schemaVersion: (event['schemaVersion'] as number) ?? 1,
        timestamp: new Date(event['timestamp'] as string),
        source: event['source'],
        aggregate: event['aggregate'],
        correlation: event['correlation'],
        metadata: event['metadata'],
        data: event['data'],
        topic,
        partition,
        offset,
        receivedAt: new Date(),
      });

      const saved = await doc.save();
      this.gatewayPublisher.publish('events', 'events:new', this.toSummaryDto(saved));
      this.logger.debug(`Saved: ${event['eventType']} from ${(event['source'] as Record<string, unknown>)?.['service']}`);
      return saved;
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        this.logger.debug(`Duplicate ignored: ${event['id']}`);
        return null;
      }
      throw err;
    }
  }

  async findByRange(filters: EventFiltersDto): Promise<EventSummaryDto[]> {
    const query: Record<string, unknown> = {
      timestamp: { $gte: new Date(filters.startDate) },
    };
    if (filters.endDate) {
      (query['timestamp'] as Record<string, unknown>)['$lte'] = new Date(filters.endDate);
    }
    if (filters.eventType) {
      query['eventType'] = { $regex: filters.eventType, $options: 'i' };
    }
    if (filters.source) {
      query['source.service'] = filters.source;
    }

    const events = await this.eventModel.find(query).sort({ timestamp: -1 }).limit(1000).exec();
    return events.map((e) => this.toSummaryDto(e));
  }

  async findById(id: string): Promise<EventDetailDto> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException(`Evento ${id} no encontrado`);
    return this.toDetailDto(event);
  }

  async getStats() {
    const total = await this.eventModel.countDocuments();

    const bySourceAgg = await this.eventModel.aggregate([
      { $group: { _id: '$source.service', count: { $sum: 1 } } },
    ]);
    const byEventTypeAgg = await this.eventModel.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const bySource: Record<string, number> = {};
    bySourceAgg.forEach((r) => { bySource[r._id] = r.count; });
    const byEventType: Record<string, number> = {};
    byEventTypeAgg.forEach((r) => { byEventType[r._id] = r.count; });

    return { total, bySource, byEventType };
  }

  async getLastOffsets(): Promise<Map<string, Map<number, number>>> {
    const results = await this.eventModel.aggregate([
      { $group: { _id: { topic: '$topic', partition: '$partition' }, maxOffset: { $max: '$offset' } } },
    ]);
    const offsets = new Map<string, Map<number, number>>();
    for (const row of results) {
      const { topic, partition } = row._id as { topic: string; partition: number };
      if (!offsets.has(topic)) offsets.set(topic, new Map());
      offsets.get(topic)!.set(partition, row.maxOffset as number);
    }
    return offsets;
  }

  private toSummaryDto(event: EventDocument): EventSummaryDto {
    return {
      id: (event._id as { toString(): string }).toString(),
      eventId: event.eventId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      source: event.source.service,
      aggregateType: event.aggregate.type,
      aggregateId: event.aggregate.id,
    };
  }

  private toDetailDto(event: EventDocument): EventDetailDto {
    return {
      ...this.toSummaryDto(event),
      schemaVersion: event.schemaVersion,
      sourceInstance: event.source.instance,
      correlationId: event.correlation?.id,
      causationId: event.correlation?.causationId,
      userId: event.metadata?.userId,
      data: event.data,
      topic: event.topic,
      partition: event.partition,
      offset: event.offset,
      receivedAt: event.receivedAt,
    };
  }
}
