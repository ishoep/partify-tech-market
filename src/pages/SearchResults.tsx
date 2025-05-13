
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useCity } from '@/context/CityContext';

// Simplified category list - same as Home page
const categories = [
  "Все категории",
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const term = searchParams.get('term') || '';
  const category = searchParams.get('category') || 'Все категории';
  const city = searchParams.get('city') || '';
  
  const { selectedCity, cities, setSelectedCity } = useCity();
  
  const [searchTerm, setSearchTerm] = React.useState(term);
  const [selectedCategory, setSelectedCategory] = React.useState(category);
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('term', searchTerm);
    params.set('category', selectedCategory);
    params.set('city', selectedCity);
    setSearchParams(params);
  };
  
  return (
    <MainLayout>
      <div className="w-full">
        {/* Search filters */}
        <div className="bg-white dark:bg-black border-b py-4">
          <div className="container flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Поиск запчасти..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 py-2 rounded-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                className="absolute right-0 top-0 rounded-r-lg h-full"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Город" />
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
          </div>
        </div>
        
        {/* Search results */}
        <div className="container py-4">
          <h2 className="text-xl font-medium mb-4">
            Результаты поиска: {term} {category !== 'Все категории' ? `в категории ${category}` : ''}
            {city ? ` в городе ${city}` : ''}
          </h2>
          
          {/* This would be replaced with actual search results */}
          <div className="text-center py-8 text-muted-foreground">
            <p>Нет результатов по вашему запросу</p>
            <p className="text-sm mt-2">Попробуйте изменить параметры поиска</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
