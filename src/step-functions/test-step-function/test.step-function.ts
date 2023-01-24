import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TestStepFunction {
  constructor(public logger: Logger) {}

  async handler(functionName: string, payload: any): Promise<any> {
    this.logger.log('eventName: ' + functionName);
    this.logger.log(JSON.stringify(payload));

    switch (functionName) {
      case 'firstStep':
        return '1';
      case 'secondStep':
        return '2';
    }
  }
}
