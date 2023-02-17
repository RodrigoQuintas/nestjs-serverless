import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ClientLambdaEvent } from './client/client-lambda-event';
import { ClientLambdaMessage } from './client/client-lambda-message';

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class MicroservicesModule {
  public static forRequestResponse(clientName: string): DynamicModule {
    if (process.env.STAGE === 'dev')
      return ClientsModule.register([
        {
          name: clientName,
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBIT_URL],
            queue: 'just_test_queue',
            queueOptions: {
              durable: true,
            },
          },
        },
      ]);

    return ClientsModule.register([
      {
        name: clientName,
        customClass: ClientLambdaMessage,
        options: {
          functionName: `nest-serverless-framework-demo-dev-microservices`,
        },
      },
    ]);
  }

  public static forEventDriven(clientName: string): DynamicModule {
    return ClientsModule.register([
      {
        name: clientName,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URL],
          queue: 'just_test_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]);
  }
}
