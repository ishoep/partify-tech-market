import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchProducts } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import ProductList from '@/components/ProductList';
import { useCity } from '@/context/CityContext';
import { Search } from 'lucide-react';

const categories = [
  "Все категории",
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTerm = searchParams.get('term') || '';
  const initialCategory = searchParams.get('category') || 'Все категории';
  const initialCity = searchParams.get('city') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [category, setCategory] = useState(initialCategory);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedCity, setSelectedCity, cities } = useCity();
  
  // Set city from URL if provided
  useEffect(() => {
    if (initialCity && cities.includes(initialCity)) {
      setSelectedCity(initialCity);
    }
  }, [initialCity, cities, setSelectedCity]);
  
  // Fetch products based on search parameters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filters: any = {};
        
        if (category && category !== "Все категории") {
          filters.category = category;
        }
        
        if (selectedCity) {
          filters.city = selectedCity;
        }
        
        const results = await searchProducts(searchTerm, filters);
        setProducts(results);
      } catch (error) {
        console.error("Error searching products:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось выполнить поиск",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchTerm, category, selectedCity, toast]);
  
  const handleSearch = () => {
    // Update URL parameters
    setSearchParams({
      term: searchTerm,
      category,
      city: selectedCity
    });
  };
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow">
            <Input
              placeholder="Поиск запчасти..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-20"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              className="absolute right-0 top-0 rounded-r-lg h-full"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:flex gap-2">
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="w-full md:w-[180px]">
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
              <SelectTrigger className="w-full md:w-[180px]">
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
        
        <div>
          <h1 className="text-2xl font-bold mb-4">
            {searchTerm ? `Результаты поиска: ${searchTerm}` : 'Все товары'}
          </h1>
          
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <ProductList 
              products={products} 
              onUpdate={() => {
                // Refresh products when something changes (like favorites)
                const fetchProducts = async () => {
                  const filters: any = {};
                  if (category && category !== "Все категории") {
                    filters.category = category;
                  }
                  if (selectedCity) {
                    filters.city = selectedCity;
                  }
                  const results = await searchProducts(searchTerm, filters);
                  setProducts(results);
                };
                fetchProducts();
              }}
              showDeliveryBadge={true}
              emptyMessage={`Нет товаров по запросу "${searchTerm}"`}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
