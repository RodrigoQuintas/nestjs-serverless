import { Server } from 'http';
import { Context } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';
import * as express from 'express';
import { TestStepFunction } from './step-functions/test-step-function/test.step-function';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RmqRequestResponseTransporter } from './microservices/transporter/rmq-request-response.transporter';
import { RmqEventTransporter } from './microservices/transporter/rmq-event.transporter';
let cachedServer: Server;
let cachedApp: INestApplication;
const lambdaMQHandler = new RmqRequestResponseTransporter();
const lambdaMQServerEvent = new RmqEventTransporter();

/**
 * File to start project main lambda and step-function lambda
 */

async function bootstrap(): Promise<Server> {
  const expressApp = express();
  const cachedApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  cachedApp.connectMicroservice<MicroserviceOptions>({
    strategy: lambdaMQHandler,
  });

  cachedApp.connectMicroservice<MicroserviceOptions>({
    strategy: lambdaMQServerEvent,
  });
  await cachedApp.init();
  return createServer(expressApp);
}

/**
 * Handler to http requests lambda
 */

export async function handler(event: any, context: Context): Promise<Response> {
  if (!cachedServer) {
    const server = await bootstrap();
    cachedServer = server;
  }
  return proxy(cachedServer, event, context, 'PROMISE').promise;
}

/**
 * Handler to step function lambda
 */

export const handlerStepFunctions = async ({ Payload }: any) => {
  console.log('handlerStepFunctions -> Payload', Payload);
  if (!cachedApp) {
    const server = await bootstrap();
    cachedServer = server;
  }
  const stateMachine = cachedApp.get(TestStepFunction);
  return await stateMachine.handler(Payload.name, Payload.payload);
};
