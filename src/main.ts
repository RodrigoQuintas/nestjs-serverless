import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
//internal (without lambda)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URL],
      queue: 'just_test_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URL],
      queue: 'just_test_queue_second',
      queueOptions: {
        durable: true,
      },
    },
  });
  console.log(process.env.RABBIT_URL);
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
