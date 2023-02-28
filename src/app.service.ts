import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject('sales') private clientSales: ClientProxy,
    @Inject('informations') private clientInformations: ClientProxy,
    @Inject('transports') private clientTransports: ClientProxy,
  ) {}
  createSales(sales: { id: number; description: string; amount: number }) {
    return firstValueFrom(
      this.clientSales.emit('create-sale', { data: sales }),
    );
  }

  async startSaleTransport(salesId) {
    return firstValueFrom(
      this.clientTransports.emit('transport-start', { data: salesId }),
    );
  }

  getSalesDetails() {
    return this.clientInformations.send(
      {
        cmd: 'sales-detail',
      },
      {
        data: {
          id: 1,
          description: 'Notebook x',
          amount: 10000,
        },
      },
    );
  }
}
