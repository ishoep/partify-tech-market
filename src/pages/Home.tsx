
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/MainLayout';
import { searchProducts, getProducts } from '@/lib/firebase';
import { Search, Truck, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCity } from '@/context/CityContext';

// Упрощенный список категорий
const categories = [
  "Все категории",
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("Все категории");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000000);
  const { toast } = useToast();
  const { selectedCity, cities, setSelectedCity } = useCity();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const allProducts = await getProducts();
        setProducts(allProducts);
        
        // Find maximum price for slider
        if (allProducts.length > 0) {
          const max = Math.max(...allProducts.map(p => p.price || 0));
          setPriceMax(max > 0 ? max : 10000000);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить товары"
        });
      } finally {
        setLoading(false);
      }
    };

    // Use a shorter timeout for the initial fetch to improve perceived performance
    const timer = setTimeout(() => {
      fetchProducts();
    }, 100);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (category !== "Все категории") {
        filters.category = category;
      }

      const searchResults = await searchProducts(searchTerm, filters);
      
      // Filter by price
      const filteredResults = searchResults.filter(product => 
        product.price >= priceMin && product.price <= priceMax
      );
      
      setProducts(filteredResults);
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось выполнить поиск"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout fullWidth compact>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#081020] to-[#000000]">
        {/* Main content with search */}
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-2 text-white">telepart</h1>
            <p className="text-gray-300">
              Поисковик запчастей для мобильной, компьютерной, аудио-видео, фото и бытовой техники
            </p>
          </div>
          
          <div className="w-full max-w-lg">
            <div className="relative">
              <Input
                placeholder="Поиск запчасти..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-20 py-3 rounded-full bg-white border-0"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                className="absolute right-0 top-0 rounded-r-full px-5 h-full bg-blue-500 hover:bg-blue-600"
                onClick={handleSearch}
              >
                Найти
              </Button>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center text-white">
                <MapPin className="h-4 w-4 mr-1" />
                <Select
                  defaultValue={selectedCity}
                  onValueChange={(value) => setSelectedCity(value)}
                >
                  <SelectTrigger className="border-0 bg-transparent text-white p-0 h-auto w-auto">
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
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Скрыть фильтры' : 'Фильтры'}
              </Button>
            </div>
            
            {showFilters && (
              <div className="mt-3 bg-white/10 rounded p-3 backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-xs mb-1 text-white">Категория</label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                    >
                      <SelectTrigger className="w-full h-8 text-sm">
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs block mb-1 text-white">Цена от:</label>
                      <Input 
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(Number(e.target.value))}
                        min={0}
                        className="w-full h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs block mb-1 text-white">Цена до:</label>
                      <Input 
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        min={0}
                        className="w-full h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results section */}
        {(products.length > 0 || loading) && (
          <div className="bg-white px-4 py-6">
            <div className="container">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-left">
                  {loading ? "Загрузка..." : `Найдено ${products.length} товаров`}
                </h2>
                
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {products.map((product) => (
                      <Link 
                        to={`/products/${product.id}`} 
                        key={product.id}
                        className="transition-transform hover:scale-[1.01]"
                      >
                        <div className="border rounded overflow-hidden h-full">
                          <div className="aspect-square w-full overflow-hidden">
                            <img
                              src={product.imageUrl || "https://placehold.co/300x300?text=Нет+фото"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2 text-left">
                            <div className="font-medium truncate text-sm">{product.name}</div>
                            <div className="text-base font-bold mt-1">
                              {product.price?.toLocaleString() || 0} UZS
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-xs text-muted-foreground truncate">
                                {product.shopName}
                              </div>
                              {product.hasDelivery && (
                                <div title="Есть доставка">
                                  <Truck className="h-3 w-3 text-primary" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : !loading && (
                  <div className="text-center py-8 border rounded">
                    <div className="text-4xl mb-2">😢</div>
                    <h3 className="text-lg font-medium">Ничего не найдено</h3>
                    <p className="text-muted-foreground text-sm">
                      Попробуйте изменить параметры поиска
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Home;
