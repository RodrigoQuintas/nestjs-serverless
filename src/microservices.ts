import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, RmqContext } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RmqEventTransporter } from './microservices/transporter/rmq-event.transporter';
import { RmqRequestResponseTransporter } from './microservices/transporter/rmq-request-response.transporter';
let cachedServer: INestApplication;
const lambdaMQHandler = new RmqRequestResponseTransporter();
const lambdaMQServerEvent = new RmqEventTransporter();

async function bootstrap(): Promise<INestApplication> {
  console.log('Criando contexto');
  const cachedAppNest = await NestFactory.create(AppModule);

  cachedAppNest.connectMicroservice<MicroserviceOptions>({
    strategy: lambdaMQHandler,
  });

  cachedAppNest.connectMicroservice<MicroserviceOptions>({
    strategy: lambdaMQServerEvent,
  });

  await cachedAppNest.startAllMicroservices();
  cachedServer = cachedAppNest;
  return cachedServer;
}

export const handler = async (event: any, context: RmqContext) => {
  console.log('handlerRabbitMQ -> event', event);
  console.log('handlerRabbitMQ -> context', context);
  if (!cachedServer) {
    console.log('bootstrap');
    const server = await bootstrap();
    cachedServer = server;
  }

  //event
  if (event.eventSource == 'aws:rmq') {
    return await lambdaMQServerEvent.handleMessage(event);
  }

  //request response
  return await lambdaMQHandler.handleMessage(event);
};
