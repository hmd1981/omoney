'use client';

import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

import { getWhatsAppHref } from '../lib/whatsapp';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function AssistantWidget({ locale }: { locale: 'fa' | 'en' }) {
  const fa = locale === 'fa';
  const whatsappHref = getWhatsAppHref(locale);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [handoffRecommended, setHandoffRecommended] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: fa
        ? 'سلام. برای بررسی نرخ، مسیر حواله یا مدارک لازم، سوالتان را بپرسید.'
        : 'Hello. Ask about rates, transfer routes, or required documents.'
    }
  ]);

  const quickQuestions = useMemo(
    () =>
      fa
        ? ['نرخ امروز ریال عمان چقدر است؟', 'چطور حواله ثبت کنم؟', 'برای انتقال به ایران چه مدارکی لازم است؟']
        : ['What is today’s OMR rate?', 'How do I start a transfer?', 'What documents are required?'],
    [fa]
  );

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
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: fa
            ? 'فعلاً پاسخ‌گویی خودکار در دسترس نیست. برای دریافت پاسخ دقیق، با کارشناس واتساپ صحبت کنید.'
            : 'Automated guidance is temporarily unavailable. Please continue with a WhatsApp specialist.'
        }
      ]);
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
                <p className="font-semibold">{fa ? 'راهنمای هوشمند OMoney' : 'OMoney Assistant'}</p>
                <p className="text-xs text-white/62">{fa ? 'پاسخ‌گویی اولیه و ارجاع به کارشناس' : 'Initial guidance and specialist handoff'}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label={fa ? 'بستن' : 'Close'}>
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
            {loading && (
              <div className="inline-flex rounded-md bg-[#f1eadc] px-3 py-2 text-sm text-[#66707d]">
                {fa ? 'در حال بررسی...' : 'Thinking...'}
              </div>
            )}
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
              <p className="font-medium text-[#101e30]">
                {fa ? 'برای نرخ قطعی و اجرای حواله، با کارشناس ادامه دهید.' : 'Continue with a specialist for the final quote.'}
              </p>
              <a href={whatsappHref} className="mt-2 inline-flex font-semibold text-[#8a6421]">
                {fa ? 'ادامه در واتساپ' : 'Continue on WhatsApp'}
              </a>
            </div>
          )}

          <form onSubmit={submit} className="flex gap-2 border-t border-black/10 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={fa ? 'سوال خود را بنویسید...' : 'Type your question...'}
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
        {fa ? 'راهنمای هوشمند' : 'AI Guide'}
      </button>
    </div>
  );
}
