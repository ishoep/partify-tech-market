
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/MainLayout';
import { Search } from 'lucide-react';
import { useCity } from '@/context/CityContext';
import RecommendedProducts from '@/components/RecommendedProducts';
import { getUniqueSellers } from '@/lib/firebase';

const categories = [
  "Все категории",
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState("Все категории");
  const [selectedSeller, setSelectedSeller] = useState('');
  const [sellers, setSellers] = useState<string[]>([]);
  const { selectedCity, cities, setSelectedCity } = useCity();
  const navigate = useNavigate();

  // Load sellers when component mounts
  useEffect(() => {
    const loadSellers = async () => {
      try {
        const uniqueSellers = await getUniqueSellers();
        setSellers(uniqueSellers);
      } catch (error) {
        console.error("Error loading sellers:", error);
      }
    };
    
    loadSellers();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('term', searchTerm);
    if (category) params.append('category', category);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedSeller) params.append('seller', selectedSeller);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <MainLayout fullWidth plainBackground>
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center px-4 py-8 w-full">
          
          {/* Заголовок на всю ширину */}
          <div className="w-full max-w-screen-xl text-center mb-8 px-2 sm:px-4 md:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Запчасти и клиенты — всё в одном месте
            </h1>
            <p className="text-sm text-muted-foreground">
              Поиск запчастей и управление клиентами в одном сервисе
            </p>
          </div>

          {/* Контейнер формы без фона и без границ */}
          <div className="w-full max-w-lg px-4 p-6 rounded-lg">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

              <Select
                value={selectedSeller}
                onValueChange={setSelectedSeller}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите продавца" />
                </SelectTrigger>
                <SelectContent>
                  {/* Fix: Changed empty string to "all" as value */}
                  <SelectItem value="all">Все продавцы</SelectItem>
                  {sellers.map((seller) => (
                    <SelectItem key={seller} value={seller}>
                      {seller}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="w-full py-2" onClick={handleSearch}>
                Найти
              </Button>
            </div>
          </div>
          
          {/* Секция с рекомендуемыми товарами */}
          <div className="w-full max-w-screen-xl mt-8 px-2 sm:px-4 md:px-8">
            <RecommendedProducts />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
