import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('TEST_QUEUE') private client: ClientProxy,
    @Inject('TEST_QUEUE_EVENT') private clientEvent: ClientProxy,
  ) {}

  getHello(): string {
    return this.appService.getHelloGet();
  }

  @Post()
  postHello(): string {
    return this.appService.getHelloPost();
  }

  @Get('test')
  getTeste(): string {
    return this.appService.getTeste();
  }

  @Get('test-send')
  async getTestSend(@Body() subscriber: any) {
    return this.client.send(
      {
        cmd: 'add-subscriber',
      },
      { data: 'teste 1' },
    );
  }

  @MessagePattern({ cmd: 'add-subscriber' })
  async addSubscriber(@Payload() subscriber: any, @Ctx() context: RmqContext) {
    //console.log(context.getMessage());
    //console.log(subscriber);
    console.log(`add-subscriber 1 ${JSON.stringify(subscriber)}`);
    return 'ok';
  }

  @Get('test-emit')
  async postEventEmit(@Body() subscriber: any) {
    this.clientEvent.emit('add-subscriber-emit', { data: 'teste' });
  }

  @EventPattern('add-subscriber-emit')
  async addSubscriberEmit(data: Record<string, unknown>) {
    //console.log(context.getMessage());
    //console.log(subscriber);
    console.log('add-subscriber-emit');
    console.log(`add-subscriber-emit ${JSON.stringify(data)}`);
    return 'ok from event';
  }
}
