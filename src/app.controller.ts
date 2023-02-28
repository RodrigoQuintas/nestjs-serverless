import { Controller, Get, Post } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(public appService: AppService) {}
  @Post()
  async createSales() {
    await this.appService.createSales({
      id: 1,
      description: 'Notebook x',
      amount: 10000,
    });

    return {
      message: 'Start sale creation',
    };
  }

  @Get()
  async getTestSend() {
    return this.appService.getSalesDetails();
  }

  @EventPattern('create-sale')
  async addSubscriberEmit(data: Record<string, unknown>) {
    console.log(`# sale has been created ${JSON.stringify(data)}`);
    await this.appService.startSaleTransport(1);
  }

  @EventPattern('transport-start')
  async startTransportProcess(data: Record<string, unknown>) {
    console.log(
      `# sale transport process been started ${JSON.stringify(data)}`,
    );
  }

  @MessagePattern({ cmd: 'sales-detail' })
  async getSaleDetail(@Payload() data: any) {
    console.log(`# sale detail ${JSON.stringify(data)}`);
    return data;
  }
}
