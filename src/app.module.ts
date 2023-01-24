import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StepFunctionsModule } from './step-functions/step-function.module';

@Module({
  imports: [StepFunctionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
