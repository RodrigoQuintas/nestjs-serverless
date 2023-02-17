import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

export class CustomServerRMQEvent
  extends Server
  implements CustomTransportStrategy
{
  listen(callback: () => void) {
    callback();
  }
  //quando bate na lambda, usado para triggar o nest
  async handleMessage(event: any) {
    console.log('event-event-event-event');
    console.log(event);
    try {
      console.log('Target Lambda function invoked');
      console.log(event);
      if (!event.rmqMessagesByQueue) {
        console.log('Invalid event data');
        return {
          statusCode: 404,
        };
      }

      console.log('Handlers');
      console.log(this.getHandlers());

      console.log('Div Data received from event source:');
      for (const queue in event.rmqMessagesByQueue) {
        console.log('queue');
        console.log(queue);

        console.log('event.rmqMessagesByQueue[queue]');
        console.log(JSON.stringify(event.rmqMessagesByQueue[queue]));
        const messageCnt = event.rmqMessagesByQueue[queue].length;
        console.log(`Total messages received from event source: ${messageCnt}`);
        for (const message of event.rmqMessagesByQueue[queue]) {
          const data = JSON.parse(atob(message.data));
          console.log(data);
          const handler = this.getHandlerByPattern(data.pattern);
          console.log('handler');
          console.log(handler);

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
      return {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
      };

      //TODO REFATORAR ESSA PARTE
      //   let topic = '';
      //   if (event.topic.includes('cmd')) {
      //     const cmd = JSON.parse(event.topic);
      //     topic = cmd;
      //   } else {
      //     topic = event.topic;
      //   }

      //   const handler = this.getHandlerByPattern(topic);
      //   if (!handler) {
      //     return;
      //   }
      //   const execution = handler(event.value);
      //   if (execution instanceof Observable) {
      //     return await firstValueFrom(execution);
      //   }
      //   return await execution;
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
