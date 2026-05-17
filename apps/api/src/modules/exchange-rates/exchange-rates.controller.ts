import { Controller, Get } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRates: ExchangeRatesService) {}

  @Get('homepage')
  homepage() {
    return this.exchangeRates.homepageRates();
  }

  @Get('catalog')
  catalog() {
    return this.exchangeRates.catalogRates();
  }
}
