import {
  ClientProxy,
  ClientProxyFactory,
  ReadPacket,
  Transport,
} from '@nestjs/microservices';
import { from, map, Observable, switchMap } from 'rxjs';

/**
 * Class used to main lambda to insert messages in rabbit to microservice lambda consume
 */
export class ClientLambdaEvent extends ClientProxy {
  client: ClientProxy;
  constructor(protected readonly options: { queue: string }) {
    super();
  }
  createClientIfNotExists() {
    if (this.client !== undefined) return;
    console.log(`# Queue to be conected ${this.options.queue}`);
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBIT_URL],
        queue: this.options.queue,
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async connect(): Promise<any> {
    return true;
  }

  async close() {
    console.log('# Close conection');
    this.client = undefined;
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    return () => {
      console.log('not implemented');
    };
  }

  public emit<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    this.createClientIfNotExists();

    console.log(`# Message emited ${pattern}`);

    const event = () => from(this.client.emit(pattern, data));
    return from(this.connect()).pipe(
      switchMap(() => event()),
      map((data: any) => data),
    );
  }

  publish(packet: ReadPacket<any>): any {
    return () => {
      console.log('not implemented');
    };
  }

  serialize(response: string) {
    return new TextEncoder().encode(response);
  }
}
