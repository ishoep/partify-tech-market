
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MainLayout from '@/components/MainLayout';
import { searchProducts, getProducts } from '@/lib/firebase';
import { Search, Truck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCity } from '@/context/CityContext';

const categories = [
  "Все категории",
  "Телефоны",
  "Планшеты",
  "Ноутбуки",
  "Аксессуары"
];

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("Все категории");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [maxPrice, setMaxPrice] = useState(10000000); // 10M UZS as default max
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
          setMaxPrice(max > 0 ? max : 10000000);
          setPriceRange([0, max > 0 ? max : 10000000]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products",
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
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
      
      setProducts(filteredResults);
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search products",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 text-left">
        <div className="glass-card p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-left">
            Поиск запчастей в {selectedCity}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Поиск по названию, модели..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
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
            
            <div>
              <Button 
                className="w-full"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 mr-2" />
                Поиск
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm mb-2 flex justify-between">
              <span>Цена: {priceRange[0].toLocaleString()} UZS</span>
              <span>{priceRange[1].toLocaleString()} UZS</span>
            </div>
            <Slider
              defaultValue={[0, maxPrice]}
              min={0}
              max={maxPrice}
              step={1000}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-left">
            {loading ? "Загрузка..." : `Найдено ${products.length} товаров`}
          </h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Link 
                  to={`/products/${product.id}`} 
                  key={product.id}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Card className="h-full overflow-hidden glass-card border-0">
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={product.imageUrl || "https://placehold.co/300x300?text=Нет+фото"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4 text-left">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="text-lg font-bold mt-1">
                        {product.price?.toLocaleString() || 0} UZS
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-muted-foreground truncate">
                          {product.shopName}
                        </div>
                        {product.hasDelivery && (
                          <div title="Есть доставка">
                            <Truck className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : !loading && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">😢</div>
              <h3 className="text-xl font-medium">Ничего не найдено</h3>
              <p className="text-muted-foreground">
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
