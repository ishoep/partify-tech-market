
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/MainLayout';
import { Search } from 'lucide-react';
import { useCity } from '@/context/CityContext';

// Simplified category list
const categories = [
  "Все категории",
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState("Все категории");
  const { selectedCity, cities, setSelectedCity } = useCity();
  const navigate = useNavigate();

  const handleSearch = () => {
    // Redirect to search results page with query params
    navigate(`/search?term=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}&city=${encodeURIComponent(selectedCity)}`);
  };

  return (
    <MainLayout fullWidth plainBackground>
      <div className="mt-56 flex flex-col items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-lg px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">telepart</h1>
            <p className="text-sm text-muted-foreground">
              Поисковик запчастей для мобильной, компьютерной, аудио-видео, фото и бытовой техники
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Поиск запчасти..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-20 py-2 rounded-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                className="absolute right-0 top-0 rounded-r-lg h-full"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedCity}
                onValueChange={setSelectedCity}
              >
                <SelectTrigger className="w-full">
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
            
            <Button className="w-full py-2" onClick={handleSearch}>
              Найти
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
