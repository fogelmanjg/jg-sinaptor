import { IsDateString, IsOptional, IsString } from 'class-validator';

export class EventFiltersDto {
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class EventSummaryDto {
  id: string;
  eventId: string;
  eventType: string;
  timestamp: Date;
  source: string;
  aggregateType: string;
  aggregateId: string;
}

export class EventDetailDto extends EventSummaryDto {
  schemaVersion: number;
  sourceInstance?: string;
  correlationId?: string;
  causationId?: string;
  userId?: string;
  data: Record<string, unknown>;
  topic: string;
  partition: number;
  offset: number;
  receivedAt: Date;
}
