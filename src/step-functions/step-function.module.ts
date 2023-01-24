import { Logger, Module } from '@nestjs/common';
import { TestStepFunction } from './test-step-function/test.step-function';
@Module({
  imports: [],
  providers: [TestStepFunction, Logger],
})
export class StepFunctionsModule {}
