
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCity } from '@/context/CityContext';
import { getProducts } from '@/lib/firebase';
import ProductList from '@/components/ProductList';
import { useToast } from '@/components/ui/use-toast';

// Simplified category list - same as Home page
const categories = [
  "Все категории",
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

// Define an interface for our filters
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
  
  const { selectedCity, cities, setSelectedCity } = useCity();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState(term);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyWithDelivery, setOnlyWithDelivery] = useState(deliveryFilter === 'delivery');
  const [onlyWithoutDelivery, setOnlyWithoutDelivery] = useState(deliveryFilter === 'nodelivery');
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        console.log('Fetching products with term:', term);
        console.log('Category filter:', category);
        console.log('City filter:', city || selectedCity);
        console.log('Delivery filter:', deliveryFilter);
        
        // Create a properly typed filters object
        const filters: SearchFilters = {};
        
        // Only add category filter if not "All categories"
        if (category !== 'Все категории') {
          filters.category = category;
        }
        
        // First, get all products matching the category filter
        const allProducts = await getProducts(filters);
        console.log('Products from getProducts:', allProducts);
        
        // Then manually filter by search term since Firebase doesn't support full text search
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
        
        console.log('Products after term filtering:', filteredByTerm);
        
        // Apply city filter - now considering multiple shop addresses
        const cityToFilter = city || selectedCity;
        let cityFilteredProducts = filteredByTerm;
        
        if (cityToFilter) {
          // Get products directly from the selected city (shop has an address in this city)
          cityFilteredProducts = filteredByTerm.filter(product => {
            // Check if product.shop exists and has addresses array
            if (product.shop && product.shop.addresses && Array.isArray(product.shop.addresses)) {
              return product.shop.addresses.some(addr => addr.city === cityToFilter);
            }
            
            // Fallback to simple city check for backward compatibility
            return product.city === cityToFilter;
          });
          
          // Add products with delivery from other cities if not filtering to only show products without delivery
          if (!onlyWithoutDelivery) {
            const deliveryProducts = filteredByTerm.filter(
              product => {
                // Check if product is not already included and has delivery
                const isFromDifferentCity = !(product.shop?.addresses?.some(addr => addr.city === cityToFilter) || product.city === cityToFilter);
                return isFromDifferentCity && product.hasDelivery === true;
              }
            );
            
            cityFilteredProducts = [...cityFilteredProducts, ...deliveryProducts];
          }
        }
        
        // Apply delivery filter
        let finalProducts = cityFilteredProducts;
        
        if (onlyWithDelivery) {
          finalProducts = cityFilteredProducts.filter(product => product.hasDelivery === true);
        } else if (onlyWithoutDelivery) {
          finalProducts = cityFilteredProducts.filter(product => product.hasDelivery !== true);
        }
        
        setProducts(finalProducts);
        console.log('Final filtered products:', finalProducts);
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
  }, [term, category, city, selectedCity, deliveryFilter, onlyWithDelivery, onlyWithoutDelivery, toast]);
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('term', searchTerm);
    params.set('category', selectedCategory);
    params.set('city', selectedCity);
    
    // Set delivery filter
    if (onlyWithDelivery) {
      params.set('delivery', 'delivery');
    } else if (onlyWithoutDelivery) {
      params.set('delivery', 'nodelivery');
    } else {
      params.set('delivery', 'all');
    }
    
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
        
        {/* Additional filters */}
        <div className="container pt-4 pb-2">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="delivery-filter" 
                checked={onlyWithDelivery} 
                onCheckedChange={() => handleDeliveryFilterChange('delivery')}
              />
              <Label htmlFor="delivery-filter" className="flex items-center">
                <Truck className="w-4 h-4 mr-1" /> Только с доставкой
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
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSearch}
            >
              Применить
            </Button>
          </div>
        </div>
        
        {/* Search results */}
        <div className="container py-4">
          <h2 className="text-xl font-medium mb-4">
            {term ? `Результаты поиска: ${term}` : 'Все товары'}
            {category !== 'Все категории' ? ` в категории ${category}` : ''}
            {(city || selectedCity) ? ` в городе ${city || selectedCity}` : ''}
            {onlyWithDelivery ? ' (только с доставкой)' : ''}
            {onlyWithoutDelivery ? ' (только без доставки)' : ''}
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
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
