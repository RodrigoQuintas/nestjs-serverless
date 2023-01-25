import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHelloGet(): string {
    return 'Hello World GET!';
  }

  getHelloPost(): string {
    return 'Hello World POST!';
  }

  getTeste(): string {
    return 'Hello World Teste!';
  }
}
