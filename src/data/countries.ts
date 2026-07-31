export interface CountryCurrency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  rateToBDT: number; // 1 Foreign Unit = X BDT
  dialCode: string; // e.g. +880, +1
}

export const ALL_COUNTRIES: CountryCurrency[] = [
  { code: 'BDT', name: 'Bangladesh', flag: '🇧🇩', symbol: '৳', rateToBDT: 1, dialCode: '+880' },
  { code: 'USD', name: 'United States', flag: '🇺🇸', symbol: '$', rateToBDT: 118.5, dialCode: '+1' },
  { code: 'GBP', name: 'United Kingdom', flag: '🇬🇧', symbol: '£', rateToBDT: 151.2, dialCode: '+44' },
  { code: 'EUR', name: 'European Union', flag: '🇪🇺', symbol: '€', rateToBDT: 128.4, dialCode: '+33' },
  { code: 'INR', name: 'India', flag: '🇮🇳', symbol: '₹', rateToBDT: 1.41, dialCode: '+91' },
  { code: 'SAR', name: 'Saudi Arabia', flag: '🇸🇦', symbol: '﷼', rateToBDT: 31.6, dialCode: '+966' },
  { code: 'AED', name: 'United Arab Emirates', flag: '🇦🇪', symbol: 'د.إ', rateToBDT: 32.2, dialCode: '+971' },
  { code: 'MYR', name: 'Malaysia', flag: '🇲🇾', symbol: 'RM', rateToBDT: 26.8, dialCode: '+60' },
  { code: 'QAR', name: 'Qatar', flag: '🇶🇦', symbol: 'QR', rateToBDT: 32.5, dialCode: '+974' },
  { code: 'KWD', name: 'Kuwait', flag: '🇰🇼', symbol: 'KD', rateToBDT: 386.0, dialCode: '+965' },
  { code: 'OMR', name: 'Oman', flag: '🇴🇲', symbol: 'OMR', rateToBDT: 307.8, dialCode: '+968' },
  { code: 'BHD', name: 'Bahrain', flag: '🇧🇭', symbol: 'BD', rateToBDT: 314.3, dialCode: '+973' },
  { code: 'SGD', name: 'Singapore', flag: '🇸🇬', symbol: 'S$', rateToBDT: 88.2, dialCode: '+65' },
  { code: 'CAD', name: 'Canada', flag: '🇨🇦', symbol: 'C$', rateToBDT: 86.4, dialCode: '+1' },
  { code: 'AUD', name: 'Australia', flag: '🇦🇺', symbol: 'A$', rateToBDT: 77.8, dialCode: '+61' },
  { code: 'JPY', name: 'Japan', flag: '🇯🇵', symbol: '¥', rateToBDT: 0.77, dialCode: '+81' },
  { code: 'CNY', name: 'China', flag: '🇨🇳', symbol: '¥', rateToBDT: 16.4, dialCode: '+86' },
  { code: 'PKR', name: 'Pakistan', flag: '🇵🇰', symbol: '₨', rateToBDT: 0.42, dialCode: '+92' },
  { code: 'TRY', name: 'Turkey', flag: '🇹🇷', symbol: '₺', rateToBDT: 3.58, dialCode: '+90' },
  { code: 'THB', name: 'Thailand', flag: '🇹🇭', symbol: '฿', rateToBDT: 3.32, dialCode: '+66' },
  { code: 'KRW', name: 'South Korea', flag: '🇰🇷', symbol: '₩', rateToBDT: 0.086, dialCode: '+82' },
  { code: 'CHF', name: 'Switzerland', flag: '🇨🇭', symbol: 'CHF', rateToBDT: 133.5, dialCode: '+41' },
  { code: 'BRL', name: 'Brazil', flag: '🇧🇷', symbol: 'R$', rateToBDT: 21.2, dialCode: '+55' },
  { code: 'RUB', name: 'Russia', flag: '🇷🇺', symbol: '₽', rateToBDT: 1.35, dialCode: '+7' },
  { code: 'ZAR', name: 'South Africa', flag: '🇿🇦', symbol: 'R', rateToBDT: 6.45, dialCode: '+27' },
  { code: 'EGP', name: 'Egypt', flag: '🇪🇬', symbol: 'E£', rateToBDT: 2.44, dialCode: '+20' },
  { code: 'NGN', name: 'Nigeria', flag: '🇳🇬', symbol: '₦', rateToBDT: 0.078, dialCode: '+234' },
  { code: 'IDR', name: 'Indonesia', flag: '🇮🇩', symbol: 'Rp', rateToBDT: 0.0073, dialCode: '+62' },
  { code: 'VND', name: 'Vietnam', flag: '🇻🇳', symbol: '₫', rateToBDT: 0.0047, dialCode: '+84' },
  { code: 'PHP', name: 'Philippines', flag: '🇵🇭', symbol: '₱', rateToBDT: 2.05, dialCode: '+63' },
  { code: 'LKR', name: 'Sri Lanka', flag: '🇱🇰', symbol: 'Rs', rateToBDT: 0.39, dialCode: '+94' },
  { code: 'NPR', name: 'Nepal', flag: '🇳🇵', symbol: 'Rs', rateToBDT: 0.88, dialCode: '+977' },
  { code: 'SEK', name: 'Sweden', flag: '🇸🇪', symbol: 'kr', rateToBDT: 11.2, dialCode: '+46' },
  { code: 'NOK', name: 'Norway', flag: '🇳🇴', symbol: 'kr', rateToBDT: 10.9, dialCode: '+47' },
  { code: 'DKK', name: 'Denmark', flag: '🇩🇰', symbol: 'kr', rateToBDT: 17.2, dialCode: '+45' },
  { code: 'MXN', name: 'Mexico', flag: '🇲🇽', symbol: 'Mex$', rateToBDT: 6.2, dialCode: '+52' },
  { code: 'ARS', name: 'Argentina', flag: '🇦🇷', symbol: '$', rateToBDT: 0.12, dialCode: '+54' },
  { code: 'COP', name: 'Colombia', flag: '🇨🇴', symbol: '$', rateToBDT: 0.029, dialCode: '+57' },
  { code: 'NZD', name: 'New Zealand', flag: '🇳🇿', symbol: 'NZ$', rateToBDT: 71.5, dialCode: '+64' },
  { code: 'IQD', name: 'Iraq', flag: '🇮🇶', symbol: 'IQD', rateToBDT: 0.090, dialCode: '+964' },
  { code: 'JOD', name: 'Jordan', flag: '🇯🇴', symbol: 'JD', rateToBDT: 167.1, dialCode: '+962' },
  { code: 'LBP', name: 'Lebanon', flag: '🇱🇧', symbol: 'L£', rateToBDT: 0.0013, dialCode: '+961' },
  { code: 'MAD', name: 'Morocco', flag: '🇲🇦', symbol: 'MAD', rateToBDT: 11.8, dialCode: '+212' },
  { code: 'KES', name: 'Kenya', flag: '🇰🇪', symbol: 'KSh', rateToBDT: 0.91, dialCode: '+254' },
  { code: 'GHS', name: 'Ghana', flag: '🇬🇭', symbol: 'GH₵', rateToBDT: 7.6, dialCode: '+233' },
  { code: 'MVR', name: 'Maldives', flag: '🇲🇻', symbol: 'Rf', rateToBDT: 7.67, dialCode: '+960' },
  { code: 'MMK', name: 'Myanmar', flag: '🇲🇲', symbol: 'K', rateToBDT: 0.056, dialCode: '+95' },
  { code: 'KHR', name: 'Cambodia', flag: '🇰🇭', symbol: '៛', rateToBDT: 0.029, dialCode: '+855' },
  { code: 'PLN', name: 'Poland', flag: '🇵🇱', symbol: 'zł', rateToBDT: 29.8, dialCode: '+48' },
  { code: 'CZK', name: 'Czech Republic', flag: '🇨🇿', symbol: 'Kč', rateToBDT: 5.1, dialCode: '+420' },
  { code: 'HUF', name: 'Hungary', flag: '🇭🇺', symbol: 'Ft', rateToBDT: 0.32, dialCode: '+36' },
  { code: 'RON', name: 'Romania', flag: '🇷🇴', symbol: 'lei', rateToBDT: 25.8, dialCode: '+40' },
  { code: 'UAH', name: 'Ukraine', flag: '🇺🇦', symbol: '₴', rateToBDT: 2.85, dialCode: '+380' },
  { code: 'ILS', name: 'Israel', flag: '🇮🇱', symbol: '₪', rateToBDT: 32.1, dialCode: '+972' },
  { code: 'KZT', name: 'Kazakhstan', flag: '🇰🇿', symbol: '₸', rateToBDT: 0.25, dialCode: '+7' },
  { code: 'UZS', name: 'Uzbekistan', flag: '🇺🇿', symbol: 'UZS', rateToBDT: 0.0093, dialCode: '+998' },
  { code: 'GEL', name: 'Georgia', flag: '🇬🇪', symbol: '₾', rateToBDT: 43.5, dialCode: '+995' },
  { code: 'AZN', name: 'Azerbaijan', flag: '🇦🇿', symbol: '₼', rateToBDT: 69.7, dialCode: '+994' },
  { code: 'CLP', name: 'Chile', flag: '🇨🇱', symbol: '$', rateToBDT: 0.12, dialCode: '+56' },
  { code: 'PEN', name: 'Peru', flag: '🇵🇪', symbol: 'S/', rateToBDT: 31.8, dialCode: '+51' },
  { code: 'CRC', name: 'Costa Rica', flag: '🇨🇷', symbol: '₡', rateToBDT: 0.23, dialCode: '+506' },
  { code: 'JMD', name: 'Jamaica', flag: '🇯🇲', symbol: 'J$', rateToBDT: 0.75, dialCode: '+1' },
  { code: 'ETB', name: 'Ethiopia', flag: '🇪🇹', symbol: 'Br', rateToBDT: 1.02, dialCode: '+251' },
  { code: 'TZS', name: 'Tanzania', flag: '🇹🇿', symbol: 'TSh', rateToBDT: 0.044, dialCode: '+255' },
  { code: 'UGX', name: 'Uganda', flag: '🇺🇬', symbol: 'USh', rateToBDT: 0.032, dialCode: '+256' },
  { code: 'DZD', name: 'Algeria', flag: '🇩🇿', symbol: 'DZD', rateToBDT: 0.88, dialCode: '+213' },
  { code: 'TND', name: 'Tunisia', flag: '🇹🇳', symbol: 'DT', rateToBDT: 38.0, dialCode: '+216' },
  { code: 'AFN', name: 'Afghanistan', flag: '🇦🇫', symbol: '؋', rateToBDT: 1.66, dialCode: '+93' },
  { code: 'YER', name: 'Yemen', flag: '🇾🇪', symbol: 'YR', rateToBDT: 0.47, dialCode: '+967' },
  { code: 'MUR', name: 'Mauritius', flag: '🇲🇺', symbol: 'Rs', rateToBDT: 2.55, dialCode: '+230' },
];

export function getCountryByCode(code: string): CountryCurrency | undefined {
  return ALL_COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

export function getCountryBySymbol(symbol: string): CountryCurrency | undefined {
  return ALL_COUNTRIES.find((c) => c.symbol === symbol || c.code === symbol);
}

export function getCountryBySymbolOrCode(query: string): CountryCurrency {
  if (!query) return ALL_COUNTRIES[0];
  const q = query.toLowerCase();
  const matchCode = ALL_COUNTRIES.find((c) => c.code.toLowerCase() === q);
  if (matchCode) return matchCode;
  const matchSymbol = ALL_COUNTRIES.find((c) => c.symbol === query || c.symbol.toLowerCase() === q);
  if (matchSymbol) return matchSymbol;
  return ALL_COUNTRIES[0];
}
