import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Country {
  code: string;
  name: string;
  ddi: string;
  flag: string;
}

const countries: Country[] = [
  // América do Sul
  { code: 'BR', name: 'Brasil', ddi: '+55', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', ddi: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', ddi: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', ddi: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', ddi: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', ddi: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Equador', ddi: '+593', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolívia', ddi: '+591', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguai', ddi: '+595', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguai', ddi: '+598', flag: '🇺🇾' },
  { code: 'GY', name: 'Guiana', ddi: '+592', flag: '🇬🇾' },
  { code: 'SR', name: 'Suriname', ddi: '+597', flag: '🇸🇷' },
  
  // América do Norte e Central
  { code: 'US', name: 'Estados Unidos', ddi: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canadá', ddi: '+1', flag: '🇨🇦' },
  { code: 'MX', name: 'México', ddi: '+52', flag: '🇲🇽' },
  { code: 'GT', name: 'Guatemala', ddi: '+502', flag: '🇬🇹' },
  { code: 'CU', name: 'Cuba', ddi: '+53', flag: '🇨🇺' },
  { code: 'DO', name: 'Rep. Dominicana', ddi: '+1', flag: '🇩🇴' },
  { code: 'HN', name: 'Honduras', ddi: '+504', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', ddi: '+503', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicarágua', ddi: '+505', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', ddi: '+506', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', ddi: '+507', flag: '🇵🇦' },
  { code: 'PR', name: 'Porto Rico', ddi: '+1', flag: '🇵🇷' },
  
  // Europa
  { code: 'PT', name: 'Portugal', ddi: '+351', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', ddi: '+34', flag: '🇪🇸' },
  { code: 'FR', name: 'França', ddi: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', ddi: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', ddi: '+39', flag: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido', ddi: '+44', flag: '🇬🇧' },
  { code: 'NL', name: 'Holanda', ddi: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', ddi: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suíça', ddi: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Áustria', ddi: '+43', flag: '🇦🇹' },
  { code: 'PL', name: 'Polônia', ddi: '+48', flag: '🇵🇱' },
  { code: 'SE', name: 'Suécia', ddi: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', ddi: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Dinamarca', ddi: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlândia', ddi: '+358', flag: '🇫🇮' },
  { code: 'IE', name: 'Irlanda', ddi: '+353', flag: '🇮🇪' },
  { code: 'GR', name: 'Grécia', ddi: '+30', flag: '🇬🇷' },
  { code: 'CZ', name: 'República Tcheca', ddi: '+420', flag: '🇨🇿' },
  { code: 'RO', name: 'Romênia', ddi: '+40', flag: '🇷🇴' },
  { code: 'HU', name: 'Hungria', ddi: '+36', flag: '🇭🇺' },
  { code: 'UA', name: 'Ucrânia', ddi: '+380', flag: '🇺🇦' },
  { code: 'RU', name: 'Rússia', ddi: '+7', flag: '🇷🇺' },
  
  // Ásia
  { code: 'JP', name: 'Japão', ddi: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', ddi: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'Índia', ddi: '+91', flag: '🇮🇳' },
  { code: 'KR', name: 'Coreia do Sul', ddi: '+82', flag: '🇰🇷' },
  { code: 'TH', name: 'Tailândia', ddi: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnã', ddi: '+84', flag: '🇻🇳' },
  { code: 'ID', name: 'Indonésia', ddi: '+62', flag: '🇮🇩' },
  { code: 'MY', name: 'Malásia', ddi: '+60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapura', ddi: '+65', flag: '🇸🇬' },
  { code: 'PH', name: 'Filipinas', ddi: '+63', flag: '🇵🇭' },
  { code: 'PK', name: 'Paquistão', ddi: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', ddi: '+880', flag: '🇧🇩' },
  { code: 'AE', name: 'Emirados Árabes', ddi: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Arábia Saudita', ddi: '+966', flag: '🇸🇦' },
  { code: 'IL', name: 'Israel', ddi: '+972', flag: '🇮🇱' },
  { code: 'TR', name: 'Turquia', ddi: '+90', flag: '🇹🇷' },
  
  // Oceania
  { code: 'AU', name: 'Austrália', ddi: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nova Zelândia', ddi: '+64', flag: '🇳🇿' },
  
  // África
  { code: 'ZA', name: 'África do Sul', ddi: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egito', ddi: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigéria', ddi: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Quênia', ddi: '+254', flag: '🇰🇪' },
  { code: 'MA', name: 'Marrocos', ddi: '+212', flag: '🇲🇦' },
  { code: 'AO', name: 'Angola', ddi: '+244', flag: '🇦🇴' },
  { code: 'MZ', name: 'Moçambique', ddi: '+258', flag: '🇲🇿' },
];

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const PhoneInputWithCountry = ({
  value,
  onChange,
  className,
  disabled = false,
}: PhoneInputWithCountryProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Parse initial value to extract country and number
  useEffect(() => {
    if (value) {
      // Try to find country by DDI
      const matchedCountry = countries.find(c => value.startsWith(c.ddi));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setPhoneNumber(value.replace(matchedCountry.ddi, '').replace(/\D/g, ''));
      } else {
        // If no match, just extract numbers
        setPhoneNumber(value.replace(/\D/g, ''));
      }
    }
  }, []);

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      onChange(`${country.ddi}${phoneNumber}`);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '').slice(0, 15);
    setPhoneNumber(numbers);
    onChange(`${selectedCountry.ddi}${numbers}`);
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[120px] shrink-0">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.ddi}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50 max-h-[300px]">
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm font-medium">{country.ddi}</span>
                <span className="text-sm text-muted-foreground">{country.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder="Número do telefone"
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
};
