type Currency = { code: string; name: string; symbol: string };

const currencyLabelsFa: Record<string, string> = {
  OMR: 'ریال عمان',
  AED: 'درهم امارات',
  TRY: 'لیر ترکیه',
  USD: 'دلار آمریکا',
  EUR: 'یورو',
  CAD: 'دلار کانادا',
  IRR: 'ریال ایران'
};

export function CurrencyFilterSelects({
  currencies,
  targetCurrency,
  sourceCurrency,
  showSource = true
}: {
  currencies: Currency[];
  targetCurrency?: string;
  sourceCurrency?: string;
  showSource?: boolean;
}) {
  return (
    <>
      <select
        name="targetCurrency"
        defaultValue={targetCurrency ?? ''}
        className="admin-input"
        title="ارزی که برای مشتری خریداری / پرداخت می‌شود"
      >
        <option value="">همه ارزهای خرید</option>
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currencyLabelsFa[currency.code] ?? currency.name} ({currency.code})
          </option>
        ))}
      </select>
      {showSource ? (
        <select name="sourceCurrency" defaultValue={sourceCurrency ?? ''} className="admin-input">
          <option value="">همه ارزهای پرداخت</option>
          {currencies.map((currency) => (
            <option key={`src-${currency.code}`} value={currency.code}>
              پرداخت با {currencyLabelsFa[currency.code] ?? currency.name} ({currency.code})
            </option>
          ))}
        </select>
      ) : null}
    </>
  );
}
