import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
<<<<<<< HEAD
import { searchProducts } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import ProductList from '@/components/ProductList';
import { useCity } from '@/context/CityContext';
import { Search } from 'lucide-react';
=======
import { Search, Truck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCity } from '@/context/CityContext';
import { getProducts } from '@/lib/firebase';
import ProductList from '@/components/ProductList';
import { useToast } from '@/components/ui/use-toast';
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d

const categories = [
  "Все категории",
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

<<<<<<< HEAD
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
=======
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

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    params.set('term', searchTerm);
    params.set('category', selectedCategory);
    params.set('city', selectedCity || '');
    
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

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const filters: SearchFilters = {};
        
        if (selectedCategory !== 'Все категории') {
          filters.category = selectedCategory;
        }
        
        const allProducts = await getProducts(filters);
        
        let filteredByTerm = allProducts;
        if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          filteredByTerm = allProducts.filter(product => 
            product.name?.toLowerCase().includes(lowerTerm) || 
            product.description?.toLowerCase().includes(lowerTerm) ||
            product.model?.toLowerCase().includes(lowerTerm) ||
            product.category?.toLowerCase().includes(lowerTerm)
          );
        }
        
        const cityToFilter = selectedCity === 'all' ? '' : selectedCity;
        let cityFilteredProducts = filteredByTerm;
        
        if (cityToFilter && !searchCountryWide) {
          cityFilteredProducts = filteredByTerm.filter(product => {
            const productCity = product.city || 
                              product.shop?.city || 
                              (product.shop?.addresses?.[0]?.city);
            
            return productCity?.toLowerCase() === cityToFilter.toLowerCase();
          });
        }
        
        let deliveryFilteredProducts = cityFilteredProducts;
        
        if (onlyWithDelivery) {
          deliveryFilteredProducts = cityFilteredProducts.filter(product => product.hasDelivery === true);
        } else if (onlyWithoutDelivery) {
          deliveryFilteredProducts = cityFilteredProducts.filter(product => product.hasDelivery !== true);
        }
        
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
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
        });
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD
    
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
=======

    fetchSearchResults();
    updateSearchParams();
  }, [
    searchTerm, 
    selectedCategory, 
    selectedCity, 
    onlyWithDelivery, 
    onlyWithoutDelivery, 
    selectedAvailability, 
    searchCountryWide, 
    toast
  ]);
  
  const handleSearch = () => {
    updateSearchParams();
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
    setSearchCountryWide(!searchCountryWide);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    if (value === 'all') {
      setSearchCountryWide(true);
    } else {
      setSearchCountryWide(false);
    }
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
                onValueChange={handleCityChange}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Город" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
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
                <Truck className="w-4 mr-1" /> Только с доставкой
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
              onClick={handleCountryWideSearch}
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
            {searchTerm ? `Результаты поиска: ${searchTerm}` : 'Все товары'}
            {selectedCategory !== 'Все категории' ? ` в категории ${selectedCategory}` : ''}
            {selectedCity && selectedCity !== 'all' && !searchCountryWide ? ` в городе ${selectedCity}` : ''}
            {selectedCity === 'all' || searchCountryWide ? ' по всей стране' : ''}
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
              onUpdate={handleSearch}
              showDeliveryBadge={true}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет результатов по вашему запросу</p>
              <p className="text-sm mt-2">Попробуйте изменить параметры поиска</p>
              {!searchCountryWide && selectedCity !== 'all' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchCountryWide(true);
                    setSelectedCity('all');
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Искать по всей стране
                </Button>
              )}
            </div>
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
          )}
        </div>
      </div>
    </MainLayout>
  );
};

<<<<<<< HEAD
export default SearchResults;
=======
export default SearchResults;
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
