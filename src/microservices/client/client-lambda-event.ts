import { ClientProxy, ReadPacket } from '@nestjs/microservices';
import { Observable, throwError as _throw } from 'rxjs';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
export class ClientLambdaEvent extends ClientProxy {
  eventSource = 'nestjs:TransportLambda';
  client: LambdaClient;
  constructor(protected readonly options: { functionName: string }) {
    super();
    this.client = new LambdaClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  async connect(): Promise<any> {
    return {};
  }

  async close() {
    this.client = null;
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    return new Observable((observer) => {
      return this.handlerLambda(packet, 'Event');
    });
  }
  public emit<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    this.connect().then((_) => {
      console.log('connected');
    });
    console.log({ pattern, data });
    return this.publish({ pattern, data });
  }
  publish(packet: ReadPacket<any>): any {
    console.log('1');
    this.handlerLambda(packet, 'Event');
  }
  handlerLambda(packet: ReadPacket<any>, InvocationType: 'Event' | 'DryRun') {
    const pattern = this.normalizePattern(packet.pattern);
    const payload = {
      eventSource: this.eventSource,
      topic: pattern,
      value: packet.data,
    };
    const params = {
      FunctionName: this.options.functionName,
      InvocationType,
      Payload: this.serialize(JSON.stringify(payload)),
    };
    console.log('invokeeee', params);
    const command = new InvokeCommand(params);
    this.client.send(command).then((event) => {
      console.log(event);
    });
  }

  serialize(response: string) {
    return new TextEncoder().encode(response);
  }
}
