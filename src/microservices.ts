import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, RmqContext } from '@nestjs/microservices';
import { CustomServerRMQ } from './microservices/transporter/rmq.server';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
let cachedServer: INestApplication;
const lambdaMQHandler = new CustomServerRMQ();

async function bootstrap(): Promise<INestApplication> {
  if (cachedServer) {
    console.log('Using cached server');
    return cachedServer;
  }
  console.log('Creating cotext');
  const cachedAppNest = await NestFactory.create(AppModule);
  cachedAppNest.connectMicroservice<MicroserviceOptions>({
    strategy: lambdaMQHandler,
  });
  await cachedAppNest.startAllMicroservices();
  cachedServer = cachedAppNest;
  return cachedServer;
}

export const handlerRabbitMQ = async (event: any, context: RmqContext) => {
  console.log('handlerRabbitMQ -> event', event);
  console.log('handlerRabbitMQ -> context', context);
  if (!cachedServer) {
    const server = await bootstrap();
    cachedServer = server;
  }
  return await lambdaMQHandler.handleMessage(event);
};
