export interface CountryCurrency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  rateToUSD: number; // 1 USD = X Local Units (Base currency: USD)
  rateToBDT: number; // Keep for fallback
  dialCode: string;
}

export const ALL_COUNTRIES: CountryCurrency[] = [
  { code: 'USD', name: 'United States', flag: '🇺🇸', symbol: '$', rateToUSD: 1, rateToBDT: 118.5, dialCode: '+1' },
  { code: 'BDT', name: 'Bangladesh', flag: '🇧🇩', symbol: '৳', rateToUSD: 118.5, rateToBDT: 1, dialCode: '+880' },
  { code: 'GBP', name: 'United Kingdom', flag: '🇬🇧', symbol: '£', rateToUSD: 0.78, rateToBDT: 151.2, dialCode: '+44' },
  { code: 'EUR', name: 'European Union', flag: '🇪🇺', symbol: '€', rateToUSD: 0.92, rateToBDT: 128.4, dialCode: '+33' },
  { code: 'INR', name: 'India', flag: '🇮🇳', symbol: '₹', rateToUSD: 83.5, rateToBDT: 1.41, dialCode: '+91' },
  { code: 'SAR', name: 'Saudi Arabia', flag: '🇸🇦', symbol: '﷼', rateToUSD: 3.75, rateToBDT: 31.6, dialCode: '+966' },
  { code: 'AED', name: 'United Arab Emirates', flag: '🇦🇪', symbol: 'د.إ', rateToUSD: 3.67, rateToBDT: 32.2, dialCode: '+971' },
  { code: 'MYR', name: 'Malaysia', flag: '🇲🇾', symbol: 'RM', rateToUSD: 4.70, rateToBDT: 26.8, dialCode: '+60' },
  { code: 'QAR', name: 'Qatar', flag: '🇶🇦', symbol: 'QR', rateToUSD: 3.64, rateToBDT: 32.5, dialCode: '+974' },
  { code: 'KWD', name: 'Kuwait', flag: '🇰🇼', symbol: 'KD', rateToUSD: 0.31, rateToBDT: 386.0, dialCode: '+965' },
  { code: 'OMR', name: 'Oman', flag: '🇴🇲', symbol: 'OMR', rateToUSD: 0.38, rateToBDT: 307.8, dialCode: '+968' },
  { code: 'BHD', name: 'Bahrain', flag: '🇧🇭', symbol: 'BD', rateToUSD: 0.38, rateToBDT: 314.3, dialCode: '+973' },
  { code: 'SGD', name: 'Singapore', flag: '🇸🇬', symbol: 'S$', rateToUSD: 1.35, rateToBDT: 88.2, dialCode: '+65' },
  { code: 'CAD', name: 'Canada', flag: '🇨🇦', symbol: 'C$', rateToUSD: 1.37, rateToBDT: 86.4, dialCode: '+1' },
  { code: 'AUD', name: 'Australia', flag: '🇦🇺', symbol: 'A$', rateToUSD: 1.52, rateToBDT: 77.8, dialCode: '+61' },
  { code: 'JPY', name: 'Japan', flag: '🇯🇵', symbol: '¥', rateToUSD: 155.0, rateToBDT: 0.77, dialCode: '+81' },
  { code: 'CNY', name: 'China', flag: '🇨🇳', symbol: '¥', rateToUSD: 7.23, rateToBDT: 16.4, dialCode: '+86' },
  { code: 'PKR', name: 'Pakistan', flag: '🇵🇰', symbol: '₨', rateToUSD: 278.5, rateToBDT: 0.42, dialCode: '+92' },
  { code: 'TRY', name: 'Turkey', flag: '🇹🇷', symbol: '₺', rateToUSD: 33.1, rateToBDT: 3.58, dialCode: '+90' },
  { code: 'THB', name: 'Thailand', flag: '🇹🇭', symbol: '฿', rateToUSD: 36.5, rateToBDT: 3.32, dialCode: '+66' },
  { code: 'KRW', name: 'South Korea', flag: '🇰🇷', symbol: '₩', rateToUSD: 1378.0, rateToBDT: 0.086, dialCode: '+82' },
  { code: 'CHF', name: 'Switzerland', flag: '🇨🇭', symbol: 'CHF', rateToUSD: 0.89, rateToBDT: 133.5, dialCode: '+41' },
  { code: 'BRL', name: 'Brazil', flag: '🇧🇷', symbol: 'R$', rateToUSD: 5.58, rateToBDT: 21.2, dialCode: '+55' },
  { code: 'RUB', name: 'Russia', flag: '🇷🇺', symbol: '₽', rateToUSD: 87.8, rateToBDT: 1.35, dialCode: '+7' },
  { code: 'ZAR', name: 'South Africa', flag: '🇿🇦', symbol: 'R', rateToUSD: 18.37, rateToBDT: 6.45, dialCode: '+27' },
  { code: 'EGP', name: 'Egypt', flag: '🇪🇬', symbol: 'E£', rateToUSD: 48.5, rateToBDT: 2.44, dialCode: '+20' },
  { code: 'NGN', name: 'Nigeria', flag: '🇳🇬', symbol: '₦', rateToUSD: 1520.0, rateToBDT: 0.078, dialCode: '+234' },
  { code: 'IDR', name: 'Indonesia', flag: '🇮🇩', symbol: 'Rp', rateToUSD: 16250.0, rateToBDT: 0.0073, dialCode: '+62' },
  { code: 'VND', name: 'Vietnam', flag: '🇻🇳', symbol: '₫', rateToUSD: 25450.0, rateToBDT: 0.0047, dialCode: '+84' },
  { code: 'PHP', name: 'Philippines', flag: '🇵🇭', symbol: '₱', rateToUSD: 58.5, rateToBDT: 2.05, dialCode: '+63' },
  { code: 'LKR', name: 'Sri Lanka', flag: '🇱🇰', symbol: 'Rs', rateToUSD: 303.5, rateToBDT: 0.39, dialCode: '+94' },
  { code: 'NPR', name: 'Nepal', flag: '🇳🇵', symbol: 'Rs', rateToUSD: 133.6, rateToBDT: 0.88, dialCode: '+977' },
  { code: 'SEK', name: 'Sweden', flag: '🇸🇪', symbol: 'kr', rateToUSD: 10.6, rateToBDT: 11.2, dialCode: '+46' },
  { code: 'NOK', name: 'Norway', flag: '🇳🇴', symbol: 'kr', rateToUSD: 10.8, rateToBDT: 10.9, dialCode: '+47' },
  { code: 'DKK', name: 'Denmark', flag: '🇩🇰', symbol: 'kr', rateToUSD: 6.88, rateToBDT: 17.2, dialCode: '+45' },
  { code: 'MXN', name: 'Mexico', flag: '🇲🇽', symbol: 'Mex$', rateToUSD: 18.8, rateToBDT: 6.2, dialCode: '+52' },
  { code: 'ARS', name: 'Argentina', flag: '🇦🇷', symbol: '$', rateToUSD: 935.0, rateToBDT: 0.12, dialCode: '+54' },
  { code: 'COP', name: 'Colombia', flag: '🇨🇴', symbol: '$', rateToUSD: 4080.0, rateToBDT: 0.029, dialCode: '+57' },
  { code: 'NZD', name: 'New Zealand', flag: '🇳🇿', symbol: 'NZ$', rateToUSD: 1.66, rateToBDT: 71.5, dialCode: '+64' },
  { code: 'IQD', name: 'Iraq', flag: '🇮🇶', symbol: 'IQD', rateToUSD: 1310.0, rateToBDT: 0.090, dialCode: '+964' },
  { code: 'JOD', name: 'Jordan', flag: '🇯🇴', symbol: 'JD', rateToUSD: 0.71, rateToBDT: 167.1, dialCode: '+962' },
  { code: 'LBP', name: 'Lebanon', flag: '🇱🇧', symbol: 'L£', rateToUSD: 89500.0, rateToBDT: 0.0013, dialCode: '+961' },
  { code: 'MAD', name: 'Morocco', flag: '🇲🇦', symbol: 'MAD', rateToUSD: 10.0, rateToBDT: 11.8, dialCode: '+212' },
  { code: 'KES', name: 'Kenya', flag: '🇰🇪', symbol: 'KSh', rateToUSD: 130.0, rateToBDT: 0.91, dialCode: '+254' },
  { code: 'GHS', name: 'Ghana', flag: '🇬🇭', symbol: 'GH₵', rateToUSD: 15.6, rateToBDT: 7.6, dialCode: '+233' },
  { code: 'MVR', name: 'Maldives', flag: '🇲🇻', symbol: 'Rf', rateToUSD: 15.4, rateToBDT: 7.67, dialCode: '+960' },
  { code: 'MMK', name: 'Myanmar', flag: '🇲🇲', symbol: 'K', rateToUSD: 2100.0, rateToBDT: 0.056, dialCode: '+95' },
  { code: 'KHR', name: 'Cambodia', flag: '🇰🇭', symbol: '៛', rateToUSD: 4090.0, rateToBDT: 0.029, dialCode: '+855' },
  { code: 'PLN', name: 'Poland', flag: '🇵🇱', symbol: 'zł', rateToUSD: 3.98, rateToBDT: 29.8, dialCode: '+48' },
  { code: 'CZK', name: 'Czech Republic', flag: '🇨🇿', symbol: 'Kč', rateToUSD: 23.2, rateToBDT: 5.1, dialCode: '+420' },
  { code: 'HUF', name: 'Hungary', flag: '🇭🇺', symbol: 'Ft', rateToUSD: 370.0, rateToBDT: 0.32, dialCode: '+36' },
  { code: 'RON', name: 'Romania', flag: '🇷🇴', symbol: 'lei', rateToUSD: 4.58, rateToBDT: 25.8, dialCode: '+40' },
  { code: 'UAH', name: 'Ukraine', flag: '🇺🇦', symbol: '₴', rateToUSD: 41.5, rateToBDT: 2.85, dialCode: '+380' },
  { code: 'ILS', name: 'Israel', flag: '🇮🇱', symbol: '₪', rateToUSD: 3.69, rateToBDT: 32.1, dialCode: '+972' },
  { code: 'KZT', name: 'Kazakhstan', flag: '🇰🇿', symbol: '₸', rateToUSD: 474.0, rateToBDT: 0.25, dialCode: '+7' },
  { code: 'UZS', name: 'Uzbekistan', flag: '🇺🇿', symbol: 'UZS', rateToUSD: 12650.0, rateToBDT: 0.0093, dialCode: '+998' },
  { code: 'GEL', name: 'Georgia', flag: '🇬🇪', symbol: '₾', rateToUSD: 2.72, rateToBDT: 43.5, dialCode: '+995' },
  { code: 'AZN', name: 'Azerbaijan', flag: '🇦🇿', symbol: '₼', rateToUSD: 1.70, rateToBDT: 69.7, dialCode: '+994' },
  { code: 'CLP', name: 'Chile', flag: '🇨🇱', symbol: '$', rateToUSD: 950.0, rateToBDT: 0.12, dialCode: '+56' },
  { code: 'PEN', name: 'Peru', flag: '🇵🇪', symbol: 'S/', rateToUSD: 3.73, rateToBDT: 31.8, dialCode: '+51' },
  { code: 'CRC', name: 'Costa Rica', flag: '🇨🇷', symbol: '₡', rateToUSD: 520.0, rateToBDT: 0.23, dialCode: '+506' },
  { code: 'JMD', name: 'Jamaica', flag: '🇯🇲', symbol: 'J$', rateToUSD: 157.0, rateToBDT: 0.75, dialCode: '+1' },
  { code: 'ETB', name: 'Ethiopia', flag: '🇪🇹', symbol: 'Br', rateToUSD: 116.0, rateToBDT: 1.02, dialCode: '+251' },
  { code: 'TZS', name: 'Tanzania', flag: '🇹🇿', symbol: 'TSh', rateToUSD: 2680.0, rateToBDT: 0.044, dialCode: '+255' },
  { code: 'UGX', name: 'Uganda', flag: '🇺🇬', symbol: 'USh', rateToUSD: 3700.0, rateToBDT: 0.032, dialCode: '+256' },
  { code: 'DZD', name: 'Algeria', flag: '🇩🇿', symbol: 'DZD', rateToUSD: 134.5, rateToBDT: 0.88, dialCode: '+213' },
  { code: 'TND', name: 'Tunisia', flag: '🇹🇳', symbol: 'DT', rateToUSD: 3.12, rateToBDT: 38.0, dialCode: '+216' },
  { code: 'AFN', name: 'Afghanistan', flag: '🇦🇫', symbol: '؋', rateToUSD: 71.4, rateToBDT: 1.66, dialCode: '+93' },
  { code: 'YER', name: 'Yemen', flag: '🇾🇪', symbol: 'YR', rateToUSD: 250.0, rateToBDT: 0.47, dialCode: '+967' },
  { code: 'MUR', name: 'Mauritius', flag: '🇲🇺', symbol: 'Rs', rateToUSD: 46.5, rateToBDT: 2.55, dialCode: '+230' },
];

export function getCountryByCode(code: string): CountryCurrency | undefined {
  return ALL_COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

export function getCountryBySymbol(symbol: string): CountryCurrency | undefined {
  return ALL_COUNTRIES.find((c) => c.symbol === symbol || c.code === symbol);
}

export function getCountryBySymbolOrCode(query: string): CountryCurrency {
  if (!query) return ALL_COUNTRIES[0]; // Default USD
  const q = query.toLowerCase();
  const matchCode = ALL_COUNTRIES.find((c) => c.code.toLowerCase() === q);
  if (matchCode) return matchCode;
  const matchSymbol = ALL_COUNTRIES.find((c) => c.symbol === query || c.symbol.toLowerCase() === q);
  if (matchSymbol) return matchSymbol;
  return ALL_COUNTRIES[0];
}
