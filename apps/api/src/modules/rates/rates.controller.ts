import { Controller, Get } from '@nestjs/common';
@Controller('rates')
export class RatesController {
  @Get()
  list() { return []; }
}
