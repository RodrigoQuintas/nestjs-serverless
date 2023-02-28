import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ClientLambdaEvent } from './client/client-lambda-event';
import { ClientLambdaRequestResponse } from './client/client-lambda-request-response';

/**
 * Module used to link nest with transporters
 */

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class MicroservicesModule {
  public static forRequestResponse(clientName: string): DynamicModule {
    //When dev stage, for request response not used the published lambda
    if (process.env.STAGE === 'dev')
      return ClientsModule.register([
        {
          name: clientName,
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBIT_URL],
            queue: clientName,
            queueOptions: {
              durable: true,
            },
          },
        },
      ]);

    return ClientsModule.register([
      {
        name: clientName,
        customClass: ClientLambdaRequestResponse,
        options: {
          functionName: process.env.MICROSERVICE_LAMBDA,
        },
      },
    ]);
  }

  public static forEventDriven(clientName: string): DynamicModule {
    return ClientsModule.register([
      {
        name: clientName,
        customClass: ClientLambdaEvent,
        options: {
          queue: clientName,
        },
      },
    ]);
  }
}
