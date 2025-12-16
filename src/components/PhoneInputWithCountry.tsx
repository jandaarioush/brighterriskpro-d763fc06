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
  { code: 'BR', name: 'Brasil', ddi: '+55', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', ddi: '+1', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', ddi: '+351', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', ddi: '+34', flag: '🇪🇸' },
  { code: 'FR', name: 'França', ddi: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', ddi: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', ddi: '+39', flag: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido', ddi: '+44', flag: '🇬🇧' },
  { code: 'AR', name: 'Argentina', ddi: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', ddi: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', ddi: '+57', flag: '🇨🇴' },
  { code: 'MX', name: 'México', ddi: '+52', flag: '🇲🇽' },
  { code: 'PE', name: 'Peru', ddi: '+51', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguai', ddi: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', ddi: '+595', flag: '🇵🇾' },
  { code: 'CA', name: 'Canadá', ddi: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Austrália', ddi: '+61', flag: '🇦🇺' },
  { code: 'JP', name: 'Japão', ddi: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', ddi: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'Índia', ddi: '+91', flag: '🇮🇳' },
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
