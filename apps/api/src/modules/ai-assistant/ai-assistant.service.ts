import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { AssistantChatDto } from './dto';

type DeepSeekResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

type ConversationIntent =
  | 'rate'
  | 'transfer'
  | 'documents'
  | 'security'
  | 'general';

type ConversationStage =
  | 'discover'
  | 'qualify'
  | 'prepare_handoff'
  | 'handoff';

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly config: ConfigService,
    private readonly exchangeRatesService: ExchangeRatesService
  ) {}

  async chat(input: AssistantChatDto) {
    const apiKey = this.config.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('Assistant is not configured');
    }

    const rates = await this.exchangeRatesService.homepageRates();
    const userTurns = input.messages.filter((message) => message.role === 'user').length;
    const conversation = this.analyzeConversation(input.messages, userTurns);
    const systemPrompt = this.buildSystemPrompt(input.locale, rates, conversation);
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.get<number>('DEEPSEEK_TIMEOUT_MS', 20_000)
    );

    try {
      const response = await fetch(
        `${this.config.get<string>('DEEPSEEK_API_URL', 'https://api.deepseek.com')}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.config.get<string>('DEEPSEEK_MODEL', 'deepseek-chat'),
            temperature: 0.35,
            max_tokens: 500,
            messages: [{ role: 'system', content: systemPrompt }, ...input.messages]
          }),
          signal: controller.signal
        }
      );

      if (!response.ok) {
        throw new Error(`DeepSeek request failed with ${response.status}`);
      }

      const data = (await response.json()) as DeepSeekResponse;
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('DeepSeek returned empty content');
      }

      return {
        message: content,
        handoffRecommended: conversation.stage === 'handoff',
        conversationStage: conversation.stage,
        detectedIntent: conversation.intent
      };
    } catch {
      throw new ServiceUnavailableException('Assistant is temporarily unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildSystemPrompt(
    locale: 'fa' | 'en',
    rates: Awaited<ReturnType<ExchangeRatesService['homepageRates']>>,
    conversation: ReturnType<AiAssistantService['analyzeConversation']>
  ) {
    const liveRates = rates
      .filter((rate) => !rate.unavailable && rate.buyRateToman !== null && rate.sellRateToman !== null)
      .map(
        (rate) =>
          `${rate.baseCurrency}/TOMAN market=${rate.marketRateToman}, buy=${rate.buyRateToman}, sell=${rate.sellRateToman}, stale=${rate.stale}`
      )
      .join('\n');

    const languageRule =
      locale === 'fa'
        ? 'Always answer in Persian unless the user explicitly asks for English.'
        : 'Always answer in English unless the user explicitly asks for Persian.';

    return `
You are the official OMoney remittance guide for a Persian-first financial service based in Oman.

Core behavior:
- Sound like a calm, precise, experienced human remittance specialist.
- Build trust through clarity, not hype.
- Ask focused follow-up questions when needed: source country, destination country, sending currency, amount, and urgency.
- Keep answers concise but useful.
- Never claim a transfer is confirmed, guaranteed, or legally approved before human review.
- Never invent rates, fees, processing times, or corridor availability.
- If the user asks for a rate, use only the live rates below and clearly say that final settlement is confirmed by the finance team.
- If a requested route is not covered by live data, say that the finance team must confirm the route.
- OMoney is not a crypto platform and does not currently provide an online payment gateway.
- OMoney supports human-assisted remittance operations related to Oman, UAE, Turkey, Iran, Europe, Canada, and the USA.
- Typical flow: request submission, identity/document review, payment proof upload, human review, processing, completion.
- Security posture: KYC/AML review, receipt checks, fraud warnings, human verification.
- Do not provide legal, tax, or sanctions advice.

Conversation strategy:
- Treat the conversation as a guided funnel, not an FAQ bot.
- Current intent: ${conversation.intent}
- Current stage: ${conversation.stage}
- Detected route: ${conversation.sourceCountry ?? 'unknown'} -> ${conversation.destinationCountry ?? 'unknown'}
- Known transfer facts: ${conversation.knownFacts.join(', ') || 'none'}
- Missing transfer facts: ${conversation.missingFacts.join(', ') || 'none'}
- In discover stage, answer the direct question briefly, then ask exactly one useful follow-up question.
- In qualify stage, continue gathering only the missing facts needed for a real quote: source country, destination country, sending currency, receiving currency, approximate amount, and urgency.
- If the user asks about documents, explain only the likely document categories and state that exact requirements depend on route and amount.
- In prepare_handoff stage, summarize what is already known in one short sentence, then explain that the finance team can confirm exact rate, required documents, and execution details on WhatsApp.
- In handoff stage, actively move the user to WhatsApp. Do not keep the conversation open-ended; give a concise summary and say the specialist can finalize the exact quote and checklist there.
- Never ask more than one follow-up question in one reply.
- Do not repeat questions that the user has already answered.
- Do not push WhatsApp before you have either enough context for a real handoff or the user explicitly asks for an exact quote, documents, or execution.

Formatting:
- ${languageRule}
- Use Persian numerals when answering in Persian.
- Mention Toman, never IRR, for public-facing rate answers.
- Keep most answers under 140 words.

Live OMoney rates:
${liveRates || 'No live rates are currently available.'}
`.trim();
  }

  private analyzeConversation(messages: AssistantChatDto['messages'], userTurns: number) {
    const normalize = (value: string) =>
      value
        .toLowerCase()
        .replace(/[يى]/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/[\u200c\u200d]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const combined = messages
      .filter((message) => message.role === 'user')
      .map((message) => normalize(message.content))
      .join(' ');

    const hasAny = (terms: string[]) => terms.some((term) => combined.includes(term));
    const countries = [
      ['عمان', 'Oman'],
      ['امارات', 'UAE'],
      ['ترکیه', 'Turkey'],
      ['ایران', 'Iran'],
      ['اروپا', 'Europe'],
      ['کانادا', 'Canada'],
      ['آمریکا', 'USA']
    ] as const;
    const routeMatch = combined.match(
      /از\s+(عمان|امارات|ترکیه|ایران|اروپا|کانادا|آمریکا)\s+به\s+(عمان|امارات|ترکیه|ایران|اروپا|کانادا|آمریکا)/
    );
    const sourceCountry = routeMatch
      ? countries.find(([fa]) => fa === routeMatch[1])?.[1]
      : undefined;
    const destinationCountry = routeMatch
      ? countries.find(([fa]) => fa === routeMatch[2])?.[1]
      : undefined;

    const intent: ConversationIntent = hasAny(['نرخ', 'قیمت', 'exchange', 'rate'])
      ? 'rate'
      : hasAny(['مدرک', 'مدارک', 'kyc', 'document'])
        ? 'documents'
        : hasAny(['امنیت', 'کلاهبرداری', 'security', 'fraud'])
          ? 'security'
          : hasAny(['حواله', 'انتقال', 'بفرستم', 'ارسال کنم', 'جابه جا کنم', 'transfer', 'send money'])
            ? 'transfer'
            : 'general';

    const facts = {
      sourceCountry,
      destinationCountry,
      sendingCurrency: hasAny(['omr', 'aed', 'try', 'usd', 'eur', 'cad', 'aud', 'ریال عمان', 'درهم', 'لیر', 'دلار', 'یورو']),
      receivingCurrency: hasAny(['تومان', 'toman']),
      amount: /\d/.test(combined) || hasAny(['هزار', 'میلیون', 'hundred', 'thousand']),
      urgency: hasAny(['فوری', 'امروز', 'عجله', 'urgent', 'today'])
    };

    const labels = {
      sourceCountry: 'source country',
      destinationCountry: 'destination country',
      sendingCurrency: 'sending currency',
      receivingCurrency: 'receiving currency',
      amount: 'approximate amount',
      urgency: 'urgency'
    } as const;

    const knownFacts = Object.entries(facts)
      .filter(([, value]) => value)
      .map(([key, value]) => {
        if (key === 'sourceCountry' || key === 'destinationCountry') {
          return `${labels[key]}=${value}`;
        }

        return labels[key as keyof typeof labels];
      });
    const missingFacts = Object.entries(facts)
      .filter(([, value]) => !value)
      .map(([key]) => labels[key as keyof typeof labels]);

    const enoughForHandoff =
      Boolean(facts.sourceCountry) &&
      Boolean(facts.destinationCountry) &&
      facts.sendingCurrency &&
      facts.receivingCurrency &&
      facts.amount;
    const exactQuoteSignal = hasAny([
      'نرخ قطعی',
      'قیمت نهایی',
      'الان چند',
      'چقدر میشه',
      'exact quote',
      'final quote'
    ]);
    const documentSignal = intent === 'documents';

    let stage: ConversationStage = 'discover';
    if (userTurns >= 2 || intent === 'transfer' || intent === 'documents') {
      stage = 'qualify';
    }
    if (enoughForHandoff || exactQuoteSignal || documentSignal) {
      stage = userTurns >= 2 ? 'handoff' : 'prepare_handoff';
    } else if (userTurns >= 3) {
      stage = 'prepare_handoff';
    }

    return {
      intent,
      stage,
      sourceCountry,
      destinationCountry,
      knownFacts,
      missingFacts
    };
  }
}
