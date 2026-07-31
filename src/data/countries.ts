export interface CountryCurrency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  rateToBDT: number; // 1 Foreign Unit = X BDT
}

export const ALL_COUNTRIES: CountryCurrency[] = [
  { code: 'BDT', name: 'Bangladesh', flag: '🇧🇩', symbol: '৳', rateToBDT: 1 },
  { code: 'USD', name: 'United States', flag: '🇺🇸', symbol: '$', rateToBDT: 118.5 },
  { code: 'GBP', name: 'United Kingdom', flag: '🇬🇧', symbol: '£', rateToBDT: 151.2 },
  { code: 'EUR', name: 'European Union', flag: '🇪🇺', symbol: '€', rateToBDT: 128.4 },
  { code: 'INR', name: 'India', flag: '🇮🇳', symbol: '₹', rateToBDT: 1.41 },
  { code: 'SAR', name: 'Saudi Arabia', flag: '🇸🇦', symbol: '﷼', rateToBDT: 31.6 },
  { code: 'AED', name: 'United Arab Emirates', flag: '🇦🇪', symbol: 'د.إ', rateToBDT: 32.2 },
  { code: 'MYR', name: 'Malaysia', flag: '🇲🇾', symbol: 'RM', rateToBDT: 26.8 },
  { code: 'QAR', name: 'Qatar', flag: '🇶🇦', symbol: 'QR', rateToBDT: 32.5 },
  { code: 'KWD', name: 'Kuwait', flag: '🇰🇼', symbol: 'KD', rateToBDT: 386.0 },
  { code: 'OMR', name: 'Oman', flag: '🇴🇲', symbol: 'OMR', rateToBDT: 307.8 },
  { code: 'BHD', name: 'Bahrain', flag: '🇧🇭', symbol: 'BD', rateToBDT: 314.3 },
  { code: 'SGD', name: 'Singapore', flag: '🇸🇬', symbol: 'S$', rateToBDT: 88.2 },
  { code: 'CAD', name: 'Canada', flag: '🇨🇦', symbol: 'C$', rateToBDT: 86.4 },
  { code: 'AUD', name: 'Australia', flag: '🇦🇺', symbol: 'A$', rateToBDT: 77.8 },
  { code: 'JPY', name: 'Japan', flag: '🇯🇵', symbol: '¥', rateToBDT: 0.77 },
  { code: 'CNY', name: 'China', flag: '🇨🇳', symbol: '¥', rateToBDT: 16.4 },
  { code: 'PKR', name: 'Pakistan', flag: '🇵🇰', symbol: '₨', rateToBDT: 0.42 },
  { code: 'TRY', name: 'Turkey', flag: '🇹🇷', symbol: '₺', rateToBDT: 3.58 },
  { code: 'THB', name: 'Thailand', flag: '🇹🇭', symbol: '฿', rateToBDT: 3.32 },
  { code: 'KRW', name: 'South Korea', flag: '🇰🇷', symbol: '₩', rateToBDT: 0.086 },
  { code: 'CHF', name: 'Switzerland', flag: '🇨🇭', symbol: 'CHF', rateToBDT: 133.5 },
  { code: 'BRL', name: 'Brazil', flag: '🇧🇷', symbol: 'R$', rateToBDT: 21.2 },
  { code: 'RUB', name: 'Russia', flag: '🇷🇺', symbol: '₽', rateToBDT: 1.35 },
  { code: 'ZAR', name: 'South Africa', flag: '🇿🇦', symbol: 'R', rateToBDT: 6.45 },
  { code: 'EGP', name: 'Egypt', flag: '🇪🇬', symbol: 'E£', rateToBDT: 2.44 },
  { code: 'NGN', name: 'Nigeria', flag: '🇳🇬', symbol: '₦', rateToBDT: 0.078 },
  { code: 'IDR', name: 'Indonesia', flag: '🇮🇩', symbol: 'Rp', rateToBDT: 0.0073 },
  { code: 'VND', name: 'Vietnam', flag: '🇻🇳', symbol: '₫', rateToBDT: 0.0047 },
  { code: 'PHP', name: 'Philippines', flag: '🇵🇭', symbol: '₱', rateToBDT: 2.05 },
  { code: 'LKR', name: 'Sri Lanka', flag: '🇱🇰', symbol: 'Rs', rateToBDT: 0.39 },
  { code: 'NPR', name: 'Nepal', flag: '🇳🇵', symbol: 'Rs', rateToBDT: 0.88 },
  { code: 'SEK', name: 'Sweden', flag: '🇸🇪', symbol: 'kr', rateToBDT: 11.2 },
  { code: 'NOK', name: 'Norway', flag: '🇳🇴', symbol: 'kr', rateToBDT: 10.9 },
  { code: 'DKK', name: 'Denmark', flag: '🇩🇰', symbol: 'kr', rateToBDT: 17.2 },
  { code: 'MXN', name: 'Mexico', flag: '🇲🇽', symbol: 'Mex$', rateToBDT: 6.2 },
  { code: 'ARS', name: 'Argentina', flag: '🇦🇷', symbol: '$', rateToBDT: 0.12 },
  { code: 'COP', name: 'Colombia', flag: '🇨🇴', symbol: '$', rateToBDT: 0.029 },
  { code: 'NZD', name: 'New Zealand', flag: '🇳🇿', symbol: 'NZ$', rateToBDT: 71.5 },
  { code: 'IQD', name: 'Iraq', flag: '🇮🇶', symbol: 'IQD', rateToBDT: 0.090 },
  { code: 'JOD', name: 'Jordan', flag: '🇯🇴', symbol: 'JD', rateToBDT: 167.1 },
  { code: 'LBP', name: 'Lebanon', flag: '🇱🇧', symbol: 'L£', rateToBDT: 0.0013 },
  { code: 'MAD', name: 'Morocco', flag: '🇲🇦', symbol: 'MAD', rateToBDT: 11.8 },
  { code: 'KES', name: 'Kenya', flag: '🇰🇪', symbol: 'KSh', rateToBDT: 0.91 },
  { code: 'GHS', name: 'Ghana', flag: '🇬🇭', symbol: 'GH₵', rateToBDT: 7.6 },
  { code: 'MVR', name: 'Maldives', flag: '🇲🇻', symbol: 'Rf', rateToBDT: 7.67 },
  { code: 'MMK', name: 'Myanmar', flag: '🇲🇲', symbol: 'K', rateToBDT: 0.056 },
  { code: 'KHR', name: 'Cambodia', flag: '🇰🇭', symbol: '៛', rateToBDT: 0.029 },
  { code: 'PLN', name: 'Poland', flag: '🇵🇱', symbol: 'zł', rateToBDT: 29.8 },
  { code: 'CZK', name: 'Czech Republic', flag: '🇨🇿', symbol: 'Kč', rateToBDT: 5.1 },
  { code: 'HUF', name: 'Hungary', flag: '🇭🇺', symbol: 'Ft', rateToBDT: 0.32 },
  { code: 'RON', name: 'Romania', flag: '🇷🇴', symbol: 'lei', rateToBDT: 25.8 },
  { code: 'UAH', name: 'Ukraine', flag: '🇺🇦', symbol: '₴', rateToBDT: 2.85 },
  { code: 'ILS', name: 'Israel', flag: '🇮🇱', symbol: '₪', rateToBDT: 32.1 },
  { code: 'KZT', name: 'Kazakhstan', flag: '🇰🇿', symbol: '₸', rateToBDT: 0.25 },
  { code: 'UZS', name: 'Uzbekistan', flag: '🇺🇿', symbol: 'UZS', rateToBDT: 0.0093 },
  { code: 'GEL', name: 'Georgia', flag: '🇬🇪', symbol: '₾', rateToBDT: 43.5 },
  { code: 'AZN', name: 'Azerbaijan', flag: '🇦🇿', symbol: '₼', rateToBDT: 69.7 },
  { code: 'CLP', name: 'Chile', flag: '🇨🇱', symbol: '$', rateToBDT: 0.12 },
  { code: 'PEN', name: 'Peru', flag: '🇵🇪', symbol: 'S/', rateToBDT: 31.8 },
  { code: 'CRC', name: 'Costa Rica', flag: '🇨🇷', symbol: '₡', rateToBDT: 0.23 },
  { code: 'JMD', name: 'Jamaica', flag: '🇯🇲', symbol: 'J$', rateToBDT: 0.75 },
  { code: 'ETB', name: 'Ethiopia', flag: '🇪🇹', symbol: 'Br', rateToBDT: 1.02 },
  { code: 'TZS', name: 'Tanzania', flag: '🇹🇿', symbol: 'TSh', rateToBDT: 0.044 },
  { code: 'UGX', name: 'Uganda', flag: '🇺🇬', symbol: 'USh', rateToBDT: 0.032 },
  { code: 'DZD', name: 'Algeria', flag: '🇩🇿', symbol: 'DZD', rateToBDT: 0.88 },
  { code: 'TND', name: 'Tunisia', flag: '🇹🇳', symbol: 'DT', rateToBDT: 38.0 },
  { code: 'AFN', name: 'Afghanistan', flag: '🇦🇫', symbol: '؋', rateToBDT: 1.66 },
  { code: 'YER', name: 'Yemen', flag: '🇾🇪', symbol: 'YR', rateToBDT: 0.47 },
  { code: 'MUR', name: 'Mauritius', flag: '🇲🇺', symbol: 'Rs', rateToBDT: 2.55 },
];

export function getCountryByCode(code: string): CountryCurrency | undefined {
  return ALL_COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

export function getCountryBySymbol(symbol: string): CountryCurrency | undefined {
  return ALL_COUNTRIES.find((c) => c.symbol === symbol);
}
