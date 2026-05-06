import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ collection: 'events', timestamps: false })
export class Event {
  @Prop({ required: true, index: true, unique: true })
  eventId: string;

  @Prop({ required: true, index: true })
  eventType: string;

  @Prop({ default: 1 })
  schemaVersion: number;

  @Prop({ required: true, type: Date, index: true })
  timestamp: Date;

  @Prop({ type: Object, required: true })
  source: { service: string; instance?: string };

  @Prop({ type: Object, required: true })
  aggregate: { type: string; id: string };

  @Prop({ type: Object })
  correlation?: { id?: string; causationId?: string };

  @Prop({ type: Object })
  metadata?: { userId?: string; [key: string]: unknown };

  @Prop({ type: Object, required: true })
  data: Record<string, unknown>;

  @Prop({ required: true, index: true })
  topic: string;

  @Prop({ required: true })
  partition: number;

  @Prop({ required: true })
  offset: number;

  @Prop({ required: true, type: Date, default: Date.now })
  receivedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ topic: 1, partition: 1, offset: 1 });
EventSchema.index({ 'source.service': 1 });
EventSchema.index({ timestamp: -1 });
