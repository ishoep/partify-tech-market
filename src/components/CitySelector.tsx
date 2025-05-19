
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCity } from '@/context/CityContext';
import { MapPin } from 'lucide-react';

const CitySelector: React.FC = () => {
  const { cities, selectedCity, setSelectedCity } = useCity();

  return (
    <div className="flex items-center">
      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
      <Select
        defaultValue={selectedCity}
        onValueChange={(value) => setSelectedCity(value)}
      >
        <SelectTrigger className="w-[140px] h-8 text-sm">
          <SelectValue placeholder="Выберите город" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySelector;
