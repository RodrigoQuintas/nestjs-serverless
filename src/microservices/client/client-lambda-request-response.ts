import {
  ClientProxy,
  ReadPacket,
  RpcException,
  WritePacket,
} from '@nestjs/microservices';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { Observable, Observer } from 'rxjs';

/**
 * Class used to main lambda to access microservice lambda to get request response
 */

export class ClientLambdaRequestResponse extends ClientProxy {
  eventSource = 'nestjs:TransportLambda';
  client: LambdaClient;
  constructor(protected readonly options: { functionName: string }) {
    super();

    //conect to AWS and pass microservice lambda name in options
    this.client = new LambdaClient({
      region: process.env.REGION_AWS,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_AWS,
        secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS,
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
      return this.handlerLambda(packet, 'DryRun', (response) => {
        if (response.err !== undefined)
          observer.error(new RpcException(response.err));
        if (response.response !== undefined) {
          observer.next(response.response);
          observer.complete();
        }
      });
    });
  }

  public send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    this.connect().then((_) => {
      console.log('connected');
    });
    return new Observable((observer: Observer<TResult>) => {
      const callback = this.createObserver(observer);
      return this.publish({ pattern, data }, callback);
    });
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): any {
    this.handlerLambda(packet, 'RequestResponse', callback);
  }

  protected createObserver<T>(
    observer: Observer<T>,
  ): (packet: WritePacket) => void {
    return ({ err, response, isDisposed }: WritePacket) => {
      if (err) {
        return observer.error(this.serializeError(err));
      } else if (response !== undefined && isDisposed) {
        observer.next(this.serializeResponse(response));
        return observer.complete();
      } else if (isDisposed) {
        return observer.complete();
      }
      observer.next(this.serializeResponse(response));
      observer.complete();
    };
  }

  handlerLambda(
    packet: ReadPacket<any>,
    InvocationType: 'RequestResponse' | 'DryRun',
    callback?: (packet: WritePacket<any>) => void,
  ) {
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

    console.log('# invoke', params);

    const command = new InvokeCommand(params);
    this.client.send(command).then(
      (event) => {
        console.log('# event', event);
        const u8 = new Uint8Array(event.Payload);
        let response: any = JSON.parse(Buffer.from(u8).toString());
        console.log('# response', response);
        if (response?.errorMessage !== undefined) {
          return callback({ err: new RpcException(response.errorMessage) });
        }
        if (response == null) {
          response = 'NO_RESPONSE';
        }
        callback({ response });
      },
      (err) => {
        console.log('# err', err);
        callback({ err: new RpcException(err) });
      },
    );
  }

  serialize(response: string) {
    return new TextEncoder().encode(response);
  }
}
