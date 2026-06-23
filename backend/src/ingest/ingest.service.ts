import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { KafkaProducerService } from '../kafka/kafka-producer.service';

const TOPIC = 'keycloak-events';

@Injectable()
export class IngestService {
  constructor(private readonly producer: KafkaProducerService) {}

  async handleKeycloakEvent(payload: Record<string, unknown>): Promise<void> {
    const event = payload['resourceType']
      ? this.fromAdminEvent(payload)
      : this.fromUserEvent(payload);

    if (event) await this.producer.publish(TOPIC, event);
  }

  private fromAdminEvent(payload: Record<string, unknown>): Record<string, unknown> {
    const resourceType  = payload['resourceType'] as string;
    const operationType = payload['operationType'] as string;
    const resourcePath  = (payload['resourcePath'] as string) ?? '';
    const aggregateId   = resourcePath.split('/').pop() ?? 'unknown';

    return {
      id:            randomUUID(),
      eventType:     `${resourceType}.${operationType}`.toLowerCase(),
      schemaVersion: 1,
      timestamp:     new Date(Number(payload['time']) || Date.now()).toISOString(),
      source:        { service: 'keycloak', instance: payload['realmId'] },
      aggregate:     { type: resourceType.toLowerCase(), id: aggregateId },
      data:          { operationType, resourceType, resourcePath, realmId: payload['realmId'], representation: payload['representation'] },
    };
  }

  private fromUserEvent(payload: Record<string, unknown>): Record<string, unknown> | null {
    const type = payload['type'] as string;
    if (!type) return null;

    return {
      id:            randomUUID(),
      eventType:     `user.${type}`.toLowerCase(),
      schemaVersion: 1,
      timestamp:     new Date(Number(payload['time']) || Date.now()).toISOString(),
      source:        { service: 'keycloak', instance: payload['realmId'] },
      aggregate:     { type: 'user', id: (payload['userId'] as string) ?? 'unknown' },
      data:          { type, realmId: payload['realmId'], userId: payload['userId'] },
    };
  }
}
