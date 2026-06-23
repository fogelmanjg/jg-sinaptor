import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestService } from './ingest.service';

@Controller('ingest')
export class IngestController {
  private readonly secret: string;

  constructor(
    private readonly ingest: IngestService,
    config: ConfigService,
  ) {
    this.secret = config.get<string>('ingest.secret', '');
  }

  @Post('keycloak')
  @HttpCode(200)
  async keycloak(
    @Headers('x-ingest-secret') secret: string,
    @Body() payload: Record<string, unknown>,
  ) {
    if (!this.secret || secret !== this.secret) throw new UnauthorizedException();
    await this.ingest.handleKeycloakEvent(payload);
    return { ok: true };
  }
}
