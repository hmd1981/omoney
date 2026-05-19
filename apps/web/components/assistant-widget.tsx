'use client';

import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Locale } from '../lib/i18n';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const whatsappHref = 'https://wa.me/message/NBV22R27A46TB1';

const copy = {
  greeting: {
    fa: 'سلام. برای بررسی نرخ، مسیر حواله یا مدارک لازم، سوالتان را بپرسید.',
    en: 'Hello. Ask about rates, transfer routes, or required documents.',
    ar: 'مرحباً. اسأل عن الأسعار، مسارات التحويل أو المستندات المطلوبة.'
  },
  questions: {
    fa: ['نرخ امروز ریال عمان چقدر است؟', 'چطور حواله ثبت کنم؟', 'برای انتقال به ایران چه مدارکی لازم است؟'],
    en: ['What is today’s OMR rate?', 'How do I start a transfer?', 'What documents are required?'],
    ar: ['كم سعر الريال العُماني اليوم؟', 'كيف أسجل طلب تحويل؟', 'ما المستندات المطلوبة للتحويل؟']
  },
  unavailable: {
    fa: 'فعلاً پاسخ‌گویی خودکار در دسترس نیست. برای دریافت پاسخ دقیق، با کارشناس واتساپ صحبت کنید.',
    en: 'Automated guidance is temporarily unavailable. Please continue with a WhatsApp specialist.',
    ar: 'الإرشاد التلقائي غير متاح حالياً. يرجى المتابعة مع مختص عبر واتساب.'
  },
  title: { fa: 'راهنمای هوشمند OMoney', en: 'OMoney Assistant', ar: 'مساعد أو ماني' },
  subtitle: {
    fa: 'پاسخ‌گویی اولیه و ارجاع به کارشناس',
    en: 'Initial guidance and specialist handoff',
    ar: 'إرشاد أولي وتحويل إلى مختص'
  },
  close: { fa: 'بستن', en: 'Close', ar: 'إغلاق' },
  thinking: { fa: 'در حال بررسی...', en: 'Thinking...', ar: 'جاري المراجعة...' },
  handoff: {
    fa: 'برای نرخ قطعی و اجرای حواله، با کارشناس ادامه دهید.',
    en: 'Continue with a specialist for the final quote.',
    ar: 'للحصول على السعر النهائي وتنفيذ التحويل، تابع مع مختص.'
  },
  continueWhatsapp: { fa: 'ادامه در واتساپ', en: 'Continue on WhatsApp', ar: 'المتابعة عبر واتساب' },
  placeholder: { fa: 'سوال خود را بنویسید...', en: 'Type your question...', ar: 'اكتب سؤالك...' },
  launcher: { fa: 'راهنمای هوشمند', en: 'AI Guide', ar: 'مساعد ذكي' }
} satisfies Record<string, Record<Locale, string> | Record<Locale, string[]>>;

export function AssistantWidget({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [handoffRecommended, setHandoffRecommended] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: copy.greeting[locale]
    }
  ]);

  const quickQuestions = useMemo(() => copy.questions[locale], [locale]);

  async function submit(event?: FormEvent, preset?: string) {
    event?.preventDefault();
    const content = (preset ?? input).trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${apiBase}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, messages: nextMessages.slice(-8) })
      });
      if (!response.ok) throw new Error('Assistant unavailable');
      const data = (await response.json()) as { message: string; handoffRecommended: boolean };
      setMessages((current) => [...current, { role: 'assistant', content: data.message }]);
      setHandoffRecommended(data.handoffRecommended);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: copy.unavailable[locale] }]);
      setHandoffRecommended(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assistant-shell fixed bottom-5 end-5 z-30">
      {open && (
        <section className="assistant-panel mb-3 flex w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-[#c7a15b]/25 bg-[#fcfbf8] shadow-2xl">
          <header className="flex items-center justify-between bg-[#101e30] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-white/8 text-[#dec58d]">
                <Bot size={18} />
              </span>
              <div>
                <p className="font-semibold">{copy.title[locale]}</p>
                <p className="text-xs text-white/62">{copy.subtitle[locale]}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label={copy.close[locale]}>
              <X size={18} />
            </button>
          </header>

          <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-md px-3 py-2 text-sm leading-7 ${
                  message.role === 'assistant'
                    ? 'bg-[#f1eadc] text-[#202732]'
                    : 'ms-auto bg-[#101e30] text-white'
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading && <div className="inline-flex rounded-md bg-[#f1eadc] px-3 py-2 text-sm text-[#66707d]">{copy.thinking[locale]}</div>}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => void submit(undefined, question)}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-[#66707d] transition hover:border-[#c7a15b]/60 hover:text-[#101e30]"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {handoffRecommended && (
            <div className="mx-4 mb-3 rounded-md border border-[#c7a15b]/35 bg-[#f7f1e5] p-3 text-sm">
              <p className="font-medium text-[#101e30]">{copy.handoff[locale]}</p>
              <a href={whatsappHref} className="mt-2 inline-flex font-semibold text-[#8a6421]">
                {copy.continueWhatsapp[locale]}
              </a>
            </div>
          )}

          <form onSubmit={submit} className="flex gap-2 border-t border-black/10 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.placeholder[locale]}
              className="h-11 min-w-0 flex-1 rounded-md border border-black/10 bg-white px-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-11 w-11 place-items-center rounded-md bg-[#101e30] text-white transition disabled:opacity-50"
            >
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="assistant-launcher inline-flex items-center gap-2 rounded-md bg-[#c7a15b] px-4 py-3 font-medium text-[#101e30] shadow-2xl transition hover:bg-[#dec58d]"
      >
        <MessageCircle size={18} />
        {copy.launcher[locale]}
      </button>
    </div>
  );
}
