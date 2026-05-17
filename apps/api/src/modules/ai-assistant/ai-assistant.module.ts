import { Module } from '@nestjs/common';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';

@Module({
  imports: [ExchangeRatesModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService]
})
export class AiAssistantModule {}
