import { CustomTransportStrategy, Server } from '@nestjs/microservices';

/**
 * Class used to transport serverless handler to nest aplication in request reponse
 */
export class RmqRequestResponseTransporter
  extends Server
  implements CustomTransportStrategy
{
  listen(callback: () => void) {
    callback();
  }

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
