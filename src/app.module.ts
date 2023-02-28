import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MicroservicesModule } from './microservices/microservices.module';
import { StepFunctionsModule } from './step-functions/step-function.module';
@Module({
  imports: [
    StepFunctionsModule,
    ConfigModule.forRoot(),
    MicroservicesModule.forEventDriven('sales'),
    MicroservicesModule.forRequestResponse('informations'),
    MicroservicesModule.forEventDriven('transports'),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
