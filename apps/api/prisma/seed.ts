import { PrismaClient, AdminRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL
  })
});

async function main() {
  const currencies = [
    ['OMR', 'Omani Rial', 'ر.ع.'],
    ['AED', 'UAE Dirham', 'د.إ'],
    ['TRY', 'Turkish Lira', '₺'],
    ['USD', 'US Dollar', '$'],
    ['EUR', 'Euro', '€'],
    ['CAD', 'Canadian Dollar', 'C$'],
    ['IRR', 'Iranian Rial', '﷼']
  ] as const;

  for (const [code, name, symbol] of currencies) {
    await prisma.currency.upsert({
      where: { code },
      update: { name, symbol },
      create: { code, name, symbol }
    });
  }

  const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@omoney.online';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? process.env.DEFAULT_ADMIN_PASSWORD ?? 'change-me-now';
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      role: AdminRole.SUPER_ADMIN,
      passwordHash: await argon2.hash(password)
    }
  });

  await prisma.exchangeRateSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      enableLiveRates: true,
      defaultProvider: process.env.EXCHANGE_RATE_DEFAULT_PROVIDER ?? 'navasan',
      fallbackProvider: process.env.EXCHANGE_RATE_FALLBACK_PROVIDER ?? 'manual',
      staleAfterSec: Number(process.env.EXCHANGE_RATE_STALE_AFTER_SEC ?? 300),
      globalBuyMarkupPercent: Number(process.env.EXCHANGE_RATE_BUY_MARKUP_PERCENT ?? 0.75),
      globalSellMarkupPercent: Number(process.env.EXCHANGE_RATE_SELL_MARKUP_PERCENT ?? 0.75)
    }
  });
}

main().finally(async () => prisma.$disconnect());
