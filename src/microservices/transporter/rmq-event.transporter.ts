import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

/**
 * Class used to transport serverless handler to nest aplication in event emitter
 */
export class RmqEventTransporter
  extends Server
  implements CustomTransportStrategy
{
  listen(callback: () => void) {
    callback();
  }
  async handleMessage(event: any) {
    console.log('# Event', event);

    try {
      if (!event.rmqMessagesByQueue) {
        console.log('# Invalid event data');
        return {
          statusCode: 404,
        };
      }

      console.log(
        '# Handler list avalable in nest aplication',
        this.getHandlers(),
      );

      for (const queue in event.rmqMessagesByQueue) {
        console.log(`# Queue ${queue}`);

        for (const message of event.rmqMessagesByQueue[queue]) {
          const data = JSON.parse(atob(message.data));

          //Find handler patter
          const handler = this.getHandlerByPattern(data.pattern);

          if (!handler) {
            return;
          }

          const execution = handler(data.data);
          if (execution instanceof Observable) {
            await firstValueFrom(execution);
          }
          await execution;
        }
      }
    } catch (error) {
      console.log(error);
      console.log('error');
      console.error(error);
    }
  }

  close() {
    console.log('close');
  }

  serialize(response: string) {
    return new TextEncoder().encode(response);
  }
}
