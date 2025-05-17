import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Truck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCity } from '@/context/CityContext';
import { getProducts } from '@/lib/firebase';
import ProductList from '@/components/ProductList';
import { useToast } from '@/components/ui/use-toast';

const categories = [
  "Все категории",
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

const availabilityOptions = [
  { value: 'all', label: 'Все товары' },
  { value: 'inStock', label: 'В наличии' },
  { value: 'outOfStock', label: 'Нет в наличии' }
];

interface SearchFilters {
  category?: string;
  shopId?: string;
  status?: string;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const term = searchParams.get('term') || '';
  const category = searchParams.get('category') || 'Все категории';
  const city = searchParams.get('city') || '';
  const deliveryFilter = searchParams.get('delivery') || 'all';
  const availabilityFilter = searchParams.get('availability') || 'all';
  const countrySearch = searchParams.get('countrySearch') === 'true';
  
  const { selectedCity, cities, setSelectedCity } = useCity();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState(term);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedAvailability, setSelectedAvailability] = useState(availabilityFilter);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyWithDelivery, setOnlyWithDelivery] = useState(deliveryFilter === 'delivery');
  const [onlyWithoutDelivery, setOnlyWithoutDelivery] = useState(deliveryFilter === 'nodelivery');
  const [searchCountryWide, setSearchCountryWide] = useState(countrySearch);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const filters: SearchFilters = {};
        
        if (category !== 'Все категории') {
          filters.category = category;
        }
        
        const allProducts = await getProducts(filters);
        
        let filteredByTerm = allProducts;
        if (term) {
          const lowerTerm = term.toLowerCase();
          filteredByTerm = allProducts.filter(product => 
            product.name?.toLowerCase().includes(lowerTerm) || 
            product.description?.toLowerCase().includes(lowerTerm) ||
            product.model?.toLowerCase().includes(lowerTerm) ||
            product.category?.toLowerCase().includes(lowerTerm)
          );
        }
        
        const cityToFilter = city || selectedCity;
        let cityFilteredProducts = filteredByTerm;
        
        // Если не выбран поиск по всей стране, фильтруем по городу
        if (cityToFilter && !searchCountryWide) {
          cityFilteredProducts = filteredByTerm.filter(product => {
            if (product.shop && product.shop.addresses && Array.isArray(product.shop.addresses)) {
              return product.shop.addresses.some(addr => addr.city === cityToFilter);
            }
            return product.city === cityToFilter;
          });
        }
        
        // Фильтр по доставке
        let deliveryFilteredProducts = cityFilteredProducts;
        
        if (onlyWithDelivery) {
          deliveryFilteredProducts = cityFilteredProducts.filter(product => product.hasDelivery === true);
        } else if (onlyWithoutDelivery) {
          deliveryFilteredProducts = cityFilteredProducts.filter(product => product.hasDelivery !== true);
        }
        
        // Фильтр по наличию
        let finalProducts = deliveryFilteredProducts;
        
        if (selectedAvailability === 'inStock') {
          finalProducts = deliveryFilteredProducts.filter(product => product.quantity > 0);
        } else if (selectedAvailability === 'outOfStock') {
          finalProducts = deliveryFilteredProducts.filter(product => product.quantity <= 0);
        }
        
        setProducts(finalProducts);
      } catch (error) {
        console.error('Error fetching search results:', error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить результаты поиска.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [term, category, city, selectedCity, deliveryFilter, onlyWithDelivery, 
      onlyWithoutDelivery, selectedAvailability, searchCountryWide, toast]);
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('term', searchTerm);
    params.set('category', selectedCategory);
    params.set('city', selectedCity);
    
    if (onlyWithDelivery) {
      params.set('delivery', 'delivery');
    } else if (onlyWithoutDelivery) {
      params.set('delivery', 'nodelivery');
    } else {
      params.set('delivery', 'all');
    }
    
    params.set('availability', selectedAvailability);
    params.set('countrySearch', searchCountryWide.toString());
    setSearchParams(params);
  };
  
  const handleDeliveryFilterChange = (type: 'delivery' | 'nodelivery') => {
    if (type === 'delivery') {
      const newValue = !onlyWithDelivery;
      setOnlyWithDelivery(newValue);
      if (newValue) {
        setOnlyWithoutDelivery(false);
      }
    } else {
      const newValue = !onlyWithoutDelivery;
      setOnlyWithoutDelivery(newValue);
      if (newValue) {
        setOnlyWithDelivery(false);
      }
    }
  };
  
  const handleAvailabilityChange = (value: string) => {
    setSelectedAvailability(value);
  };

  const handleCountryWideSearch = () => {
    setSearchCountryWide(true);
    // Обновляем параметры поиска
    const params = new URLSearchParams(searchParams);
    params.set('countrySearch', 'true');
    setSearchParams(params);
  };

  return (
    <MainLayout>
      <div className="w-full">
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
                  <SelectItem value="">
                    Все города
                  </SelectItem>
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
        
        <div className="container pt-4 pb-2">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="delivery-filter" 
                checked={onlyWithDelivery} 
                onCheckedChange={() => handleDeliveryFilterChange('delivery')}
              />
              <Label htmlFor="delivery-filter" className="flex items-center">
                <Truck className="w-4 w-4 mr-1" /> Только с доставкой
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="nodelivery-filter" 
                checked={onlyWithoutDelivery} 
                onCheckedChange={() => handleDeliveryFilterChange('nodelivery')}
              />
              <Label htmlFor="nodelivery-filter">Без доставки</Label>
            </div>
            
            <Select
              value={selectedAvailability}
              onValueChange={handleAvailabilityChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Наличие" />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={searchCountryWide ? "default" : "outline"}
              onClick={() => setSearchCountryWide(!searchCountryWide)}
              className="flex items-center gap-1"
            >
              <MapPin className="h-4 w-4" />
              {searchCountryWide ? 'По всей стране' : 'Только в городе'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSearch}
            >
              Применить
            </Button>
          </div>
        </div>
        
        <div className="container py-4">
          <h2 className="text-xl font-medium mb-4">
            {term ? `Результаты поиска: ${term}` : 'Все товары'}
            {category !== 'Все категории' ? ` в категории ${category}` : ''}
            {(city || selectedCity) && !searchCountryWide ? ` в городе ${city || selectedCity}` : ' по всей стране'}
            {onlyWithDelivery ? ' (только с доставкой)' : ''}
            {onlyWithoutDelivery ? ' (только без доставки)' : ''}
            {selectedAvailability === 'inStock' ? ' (только в наличии)' : ''}
            {selectedAvailability === 'outOfStock' ? ' (только нет в наличии)' : ''}
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Загрузка результатов...</p>
            </div>
          ) : products.length > 0 ? (
            <ProductList 
              products={products} 
              onUpdate={() => handleSearch()}
              showDeliveryBadge={true}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет результатов по вашему запросу</p>
              <p className="text-sm mt-2">Попробуйте изменить параметры поиска</p>
              {!searchCountryWide && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCountryWideSearch}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Искать по всей стране
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;