
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/MainLayout';
import { searchProducts, getProducts } from '@/lib/firebase';
import { Search, Truck } from 'lucide-react';
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
  const [category, setCategory] = useState("Все категории");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000000);
  const { toast } = useToast();
  const { selectedCity } = useCity();

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

    fetchProducts();
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
    <MainLayout compact>
      <div className="space-y-3">
        {/* Упрощенный блок поиска */}
        <div className="border rounded p-3">
          <h1 className="text-xl font-bold mb-3 text-left">
            Поиск в {selectedCity}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-5">
              <Input
                placeholder="Поиск по названию, модели..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-4">
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
            </div>
            
            <div className="md:col-span-3">
              <Button 
                className="w-full"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 mr-2" />
                Поиск
              </Button>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">Цена от:</label>
              <Input 
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                min={0}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm block mb-1">Цена до:</label>
              <Input 
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                min={0}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
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
    </MainLayout>
  );
};

export default Home;
