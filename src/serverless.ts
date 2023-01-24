import { Server } from 'http';
import { Context } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';
import * as express from 'express';
import { createApp } from './app';
import { TestStepFunction } from './step-functions/test-step-function/test.step-function';
import { INestApplication } from '@nestjs/common';
let cachedServer: Server;
let cachedApp: INestApplication;
async function bootstrap(): Promise<Server> {
  const expressApp = express();
  cachedApp = await createApp(expressApp);
  await cachedApp.init();
  return createServer(expressApp);
}
export async function handler(event: any, context: Context): Promise<Response> {
  if (!cachedServer) {
    const server = await bootstrap();
    cachedServer = server;
  }
  console.log(event);
  return proxy(cachedServer, event, context, 'PROMISE').promise;
}

export const handlerStepFunctions = async ({ Payload }: any) => {
  console.log('handlerStepFunctions -> Payload', Payload);
  if (!cachedApp) {
    const server = await bootstrap();
    cachedServer = server;
  }
  const stateMachine = cachedApp.get(TestStepFunction);
  return await stateMachine.handler(Payload.name, Payload.payload);
};
