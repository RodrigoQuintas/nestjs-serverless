import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

export class CustomServerRMQ extends Server implements CustomTransportStrategy {
  listen(callback: () => void) {
    callback();
  }
  //quando bate na lambda, usado para triggar o nest
  // async handleMessage(event: any) {
  //   try {
  //     //TODO REFATORAR ESSA PARTE
  //     let topic = '';
  //     if (event.topic.includes('cmd')) {
  //       const cmd = JSON.parse(event.topic);
  //       topic = cmd;
  //     } else {
  //       topic = event.topic;
  //     }

  //     const handler = this.getHandlerByPattern(topic);
  //     if (!handler) {
  //       return;
  //     }
  //     const execution = handler(event.value);
  //     if (execution instanceof Observable) {
  //       return await firstValueFrom(execution);
  //     }
  //     return await execution;
  //   } catch (error) {
  //     console.log(error);
  //     console.log('error');
  //     console.error(error);
  //   }
  // }

  async handleMessage(event) {
    const handler = this.getHandlerByPattern(event.topic);
    if (!handler) {
      return;
    }
    return await handler(event.value);
  }

  close() {
    console.log('close');
  }

  serialize(response: string) {
    return new TextEncoder().encode(response);
  }
}
