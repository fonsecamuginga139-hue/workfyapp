import React from 'react';

export const COUNTRIES = [
  { code: 'AO', name: 'Angola', dial: '244', flag: '🇦🇴' },
  { code: 'BR', name: 'Brasil', dial: '55', flag: '🇧🇷' },
  { code: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹' },
  { code: 'US', name: 'EUA / Canadá', dial: '1', flag: '🇺🇸' },
  { code: 'ES', name: 'Espanha', dial: '34', flag: '🇪🇸' },
  { code: 'MZ', name: 'Moçambique', dial: '258', flag: '🇲🇿' },
  { code: 'CV', name: 'Cabo Verde', dial: '238', flag: '🇨🇻' },
  { code: 'ST', name: 'São Tomé e Príncipe', dial: '239', flag: '🇸🇹' },
  { code: 'GW', name: 'Guiné-Bissau', dial: '245', flag: '🇬🇼' },
  { code: 'TL', name: 'Timor-Leste', dial: '670', flag: '🇹🇱' },
  { code: 'FR', name: 'França', dial: '33', flag: '🇫🇷' },
  { code: 'GB', name: 'Reino Unido', dial: '44', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha', dial: '49', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', dial: '39', flag: '🇮🇹' },
  { code: 'NL', name: 'Países Baixos', dial: '31', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', dial: '32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suíça', dial: '41', flag: '🇨🇭' },
  { code: 'LU', name: 'Luxemburgo', dial: '352', flag: '🇱🇺' },
  { code: 'ZA', name: 'África do Sul', dial: '27', flag: '🇿🇦' },
  { code: 'NA', name: 'Namíbia', dial: '264', flag: '🇳🇦' },
  { code: 'CD', name: 'RD Congo', dial: '243', flag: '🇨🇩' },
  { code: 'CG', name: 'Congo', dial: '242', flag: '🇨🇬' },
  { code: 'ZM', name: 'Zâmbia', dial: '260', flag: '🇿🇲' },
  { code: 'NG', name: 'Nigéria', dial: '234', flag: '🇳🇬' },
  { code: 'MA', name: 'Marrocos', dial: '212', flag: '🇲🇦' },
  { code: 'AE', name: 'Emirados Árabes', dial: '971', flag: '🇦🇪' },
  { code: 'CN', name: 'China', dial: '86', flag: '🇨🇳' },
  { code: 'IN', name: 'Índia', dial: '91', flag: '🇮🇳' },
  { code: 'MX', name: 'México', dial: '52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dial: '54', flag: '🇦🇷' },
  { code: 'CO', name: 'Colômbia', dial: '57', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', dial: '56', flag: '🇨🇱' },
];

/** Splits "+351 912 345 678" into dial code and local number (longest code match wins). */
export function splitPhone(value: string): { dial: string; local: string } {
  const v = (value || '').trim();
  if (!v.startsWith('+')) return { dial: '244', local: v };
  const digits = v.replace(/[^\d]/g, '');
  const match = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => digits.startsWith(c.dial));
  if (!match) return { dial: '244', local: v };
  return { dial: match.dial, local: v.replace(/^\+\s*/, '').slice(match.dial.length).trim() };
}

interface PhoneInputProps { value: string; onChange: (v: string) => void; className?: string; placeholder?: string }

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, className = '', placeholder = '923 000 000' }) => {
  const { dial, local } = splitPhone(value);
  const emit = (d: string, l: string) => onChange(l.trim() ? `+${d} ${l.trimStart()}` : '');
  const current = COUNTRIES.find((c) => c.dial === dial);
  return (
    <div className={`flex w-full min-w-0 items-stretch rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] focus-within:border-[#155EEF] focus-within:bg-white ${className}`}>
      <select
        aria-label="País"
        value={current?.code || 'AO'}
        onChange={(e) => emit(COUNTRIES.find((c) => c.code === e.target.value)!.dial, local)}
        className="w-[104px] shrink-0 rounded-l-xl border-r border-[#EEF3F8] bg-transparent py-2 pl-2 pr-1 text-xs text-[#0B1F3A] focus:outline-hidden"
      >
        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} +{c.dial} {c.name}</option>)}
      </select>
      <input
        type="tel"
        inputMode="tel"
        value={local}
        onChange={(e) => emit(dial, e.target.value.replace(/[^\d\s-]/g, ''))}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2 px-3 text-xs text-[#0B1F3A] focus:outline-hidden"
      />
    </div>
  );
};
