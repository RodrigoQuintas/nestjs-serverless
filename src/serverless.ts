import { Server } from 'http';
import { Context } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';
import e, * as express from 'express';
import { createApp } from './app';
import { TestStepFunction } from './step-functions/test-step-function/test.step-function';
import { INestApplication } from '@nestjs/common';
import {
  MicroserviceOptions,
  RmqContext,
  Transport,
} from '@nestjs/microservices';
import { CustomServerRMQ } from './microservices/transporter/rmq.server';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomServerRMQEvent } from './microservices/transporter/rmq-event.server';
let cachedServer: Server;
let cachedServerMq: INestApplication;
let cachedApp: INestApplication;
const lambdaMQHandler = new CustomServerRMQ();
const lambdaMQServerEvent = new CustomServerRMQEvent();
async function bootstrap(): Promise<Server> {
  const expressApp = express();
  cachedApp = await createApp(expressApp);
  await cachedApp.init();
  // cachedApp.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [
  //       //'amqp://guest:guest@localhost:5672',
  //       `amqps://rquintasmq:$Change1$Change1@b-26da2c7a-cc84-4bf1-818e-81d54faa713b.mq.us-east-1.amazonaws.com:5671/`,
  //     ],
  //     queue: 'just_test_queue',
  //     queueOptions: {
  //       durable: true,
  //     },
  //   },
  // });
  // await cachedApp.startAllMicroservices();
  return createServer(expressApp);
}

//http
export async function handler(event: any, context: Context): Promise<Response> {
  if (!cachedServer) {
    const server = await bootstrap();
    cachedServer = server;
  }
  return proxy(cachedServer, event, context, 'PROMISE').promise;
}

//step functions
export const handlerStepFunctions = async ({ Payload }: any) => {
  console.log('handlerStepFunctions -> Payload', Payload);
  if (!cachedApp) {
    const server = await bootstrap();
    cachedServer = server;
  }
  const stateMachine = cachedApp.get(TestStepFunction);
  return await stateMachine.handler(Payload.name, Payload.payload);
};

async function bootstrapRabbit(): Promise<INestApplication> {
  if (cachedApp) {
    console.log('Using cached server');
    return cachedApp;
  }
  console.log('Criando contexto');
  const cachedAppNest = await NestFactory.create(AppModule);
  cachedAppNest.connectMicroservice<MicroserviceOptions>({
    strategy: lambdaMQHandler,
  });
  cachedAppNest.connectMicroservice<MicroserviceOptions>({
    strategy: lambdaMQServerEvent,
  });
  await cachedAppNest.startAllMicroservices();
  cachedApp = cachedAppNest;
  return cachedApp;
}

//rabbit
export const handlerRabbitMQ = async (event: any, context: RmqContext) => {
  console.log('handlerRabbitMQ -> event', event);
  console.log('handlerRabbitMQ -> context', context);
  if (!cachedServerMq) {
    console.log('bootstrap');
    const server = await bootstrapRabbit();
    cachedServerMq = server;
  } else {
    console.log('sem bootstrap');
    console.log(cachedServerMq);
  }
  if (event.eventSource == 'aws:rmq') {
    return await lambdaMQServerEvent.handleMessage(event);
  }
  return await lambdaMQHandler.handleMessage(event);
};
