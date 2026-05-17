import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiAssistantService } from './ai-assistant.service';
import { AssistantChatDto } from './dto';

@Controller('assistant')
export class AiAssistantController {
  constructor(private readonly assistantService: AiAssistantService) {}

  @Post('chat')
  @Throttle({ default: { ttl: 60_000, limit: 12 } })
  chat(@Body() body: AssistantChatDto) {
    return this.assistantService.chat(body);
  }
}
