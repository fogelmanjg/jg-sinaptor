import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('api')
  health() {
    return { status: 'ok', service: 'jg-sinaptor-backend' };
  }
}
