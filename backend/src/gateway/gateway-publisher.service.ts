import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';

@Injectable()
export class GatewayPublisherService {
  private readonly logger = new Logger(GatewayPublisherService.name);
  private readonly wsUrl: string | null;
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    this.wsUrl = config.get<string | null>('gateway.wsUrl') ?? null;
    this.secret = config.get<string>('gateway.internalSecret') ?? '';
  }

  async publish(channel: string, event: string, data: unknown): Promise<void> {
    if (!this.wsUrl) return;

    const path = '/ws/internal/publish';
    const body = JSON.stringify({ channel, event, data });
    const timestamp = Date.now().toString();
    const headers = this.buildHeaders(timestamp, 'POST', path, body);

    try {
      const res = await fetch(`${this.wsUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body,
      });
      if (!res.ok) {
        this.logger.warn(`Gateway publish failed: ${res.status} (channel: ${channel})`);
      }
    } catch (err: unknown) {
      this.logger.warn(`Gateway unreachable (channel: ${channel}): ${(err as Error).message}`);
    }
  }

  private buildHeaders(timestamp: string, method: string, path: string, body: string): Record<string, string> {
    if (!this.secret) return {};
    const bodyHash = createHash('sha256').update(body).digest('hex');
    const payload = `${timestamp}:${method.toUpperCase()}:${path}:${bodyHash}`;
    const signature = createHmac('sha256', this.secret).update(payload).digest('hex');
    return { 'x-internal-timestamp': timestamp, 'x-internal-signature': signature };
  }
}
