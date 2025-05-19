
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchProducts } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import ProductListWrapper from '@/components/ProductListWrapper';
import { useCity } from '@/context/CityContext';
import { Search, Grid, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const initialSeller = searchParams.get('seller') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [category, setCategory] = useState(initialCategory);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sellers, setSellers] = useState<string[]>([]);
  const [selectedSeller, setSelectedSeller] = useState(initialSeller);
  const { toast } = useToast();
  const { selectedCity, setSelectedCity, cities } = useCity();
  
  // Set city from URL if provided
  useEffect(() => {
    if (initialCity && cities.includes(initialCity)) {
      setSelectedCity(initialCity);
    }
  }, [initialCity, cities, setSelectedCity]);
  
  // Fetch sellers list
  useEffect(() => {
    const getUniqueSellers = async () => {
      try {
        // This is a simplified approach - in a real app you'd fetch sellers from a dedicated endpoint
        const allProducts = await searchProducts("", {});
        const uniqueSellers = Array.from(new Set(allProducts
          .map(product => product.shop?.name)
          .filter(Boolean)));
        
        setSellers(uniqueSellers as string[]);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };
    
    getUniqueSellers();
  }, []);
  
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
        
        if (selectedSeller) {
          filters.sellerName = selectedSeller;
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
  }, [searchTerm, category, selectedCity, selectedSeller, toast]);
  
  const handleSearch = () => {
    // Update URL parameters
    setSearchParams({
      term: searchTerm,
      category,
      city: selectedCity,
      ...(selectedSeller && { seller: selectedSeller })
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
          
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
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
            
            <Select
              value={selectedSeller}
              onValueChange={setSelectedSeller}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Продавец" />
              </SelectTrigger>
              <SelectContent>
                {/* Fix: Changed empty string to "all" as value */}
                <SelectItem key="all-sellers" value="all">Все продавцы</SelectItem>
                {sellers.map((seller) => (
                  <SelectItem key={seller} value={seller}>
                    {seller}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {searchTerm ? `Результаты поиска: ${searchTerm}` : 'Все товары'}
            </h1>
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
              <ToggleGroupItem value="grid" aria-label="Сетка">
                <Grid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Список">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <ProductListWrapper 
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
                  if (selectedSeller) {
                    filters.sellerName = selectedSeller;
                  }
                  const results = await searchProducts(searchTerm, filters);
                  setProducts(results);
                };
                fetchProducts();
              }}
              showDeliveryBadge={true}
              emptyMessage={`Нет товаров по запросу "${searchTerm}"`}
              viewMode={viewMode}
              showActions={true}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
