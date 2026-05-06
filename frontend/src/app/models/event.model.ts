export interface EventSummary {
  id: string;
  eventId: string;
  eventType: string;
  timestamp: string;
  source: string;
  aggregateType: string;
  aggregateId: string;
}

export interface EventDetail extends EventSummary {
  schemaVersion: number;
  sourceInstance?: string;
  correlationId?: string;
  causationId?: string;
  userId?: string;
  data: Record<string, unknown>;
  topic: string;
  partition: number;
  offset: number;
  receivedAt: string;
}

export interface EventStats {
  total: number;
  bySource: Record<string, number>;
  byEventType: Record<string, number>;
}

export interface EventFilters {
  startDate: string;
  endDate?: string;
  eventType?: string;
  source?: string;
}
