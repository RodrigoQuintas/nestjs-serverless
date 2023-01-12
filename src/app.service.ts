import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHelloGet(): string {
    return 'Hello World GET!';
  }

  getHelloPost(): string {
    return 'Hello World POST!';
  }
}
