import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'multiface-web-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
