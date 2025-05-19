
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Package, Percent } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { addToFavorites, removeFromFavorites, isProductInFavorites } from '@/lib/firebase';

// Define product interface for type safety
interface Product {
  id: string;
  name?: string;
  imageUrl?: string;
  category?: string;
  price?: number;
  discountPercent?: number;
  discountedPrice?: number;
  isFavorite?: boolean;
  [key: string]: any; // Allow other properties
}

const RecommendedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        // Получаем товары со скидкой более 30%
        const q = query(
          productsRef,
          where("discountPercent", ">=", 30),
          orderBy("discountPercent", "desc"), // Сортировка по убыванию скидки
          limit(10) // Ограничиваем количество результатов
        );
        
        const querySnapshot = await getDocs(q);
        const recommendedProducts: Product[] = [];
        
        for (const doc of querySnapshot.docs) {
          const productData = { id: doc.id, ...doc.data() } as Product;
          
          // Проверяем, в избранном ли товар
          if (currentUser) {
            productData.isFavorite = await isProductInFavorites(currentUser.uid, doc.id);
          }
          
          recommendedProducts.push(productData);
        }
        
        setProducts(recommendedProducts);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить рекомендации"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [currentUser, toast]);

  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleToggleFavorite = async (product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Войдите в систему, чтобы добавить товар в избранное."
      });
      return;
    }
    
    try {
      const isInFavorites = await isProductInFavorites(currentUser.uid, product.id);
      
      if (isInFavorites) {
        await removeFromFavorites(currentUser.uid, product.id);
        // Immediately update the UI
        product.isFavorite = false;
        toast({
          title: "Успех",
          description: "Товар удален из избранного."
        });
      } else {
        await addToFavorites(currentUser.uid, product.id);
        // Immediately update the UI
        product.isFavorite = true;
        toast({
          title: "Успех",
          description: "Товар добавлен в избранное."
        });
      }
      
      // Update state to trigger re-render
      setProducts([...products]);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить избранное."
      });
    }
  };

  if (loading) {
    return <div className="py-2">Загрузка рекомендаций...</div>;
  }

  if (products.length === 0) {
    return null; // Не показываем секцию, если нет рекомендаций
  }

  return (
    <div className="py-4 w-full">
      <h2 className="text-xl font-bold mb-4 text-left">Рекомендуемые товары</h2>
      
      <Carousel 
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <div className="h-full">
                <Card 
                  className="h-full flex flex-col cursor-pointer" 
                  onClick={() => handleViewProduct(product.id)}
                >
                  <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="object-contain h-full w-full"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-gray-400" />
                    )}
                    {/* Значок скидки */}
                    <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 flex items-center">
                      <Percent className="h-3 w-3 mr-0.5" />
                      <span className="text-xs font-bold">{product.discountPercent}%</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-3 flex-grow">
                    <h3 className="font-medium line-clamp-1 text-left">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1 text-left">{product.category}</p>
                    <div className="mt-2 text-left">
                      <div className="line-through text-muted-foreground text-xs">
                        {product.price?.toLocaleString()} сум
                      </div>
                      <div className="font-bold text-red-500">
                        {product.discountedPrice?.toLocaleString()} сум
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-3 pt-0 flex justify-end">
                    {currentUser && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto"
                        onClick={(e) => handleToggleFavorite(product, e)}
                      >
                        <Heart 
                          className={`h-4 w-4 ${product.isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </div>
      </Carousel>
    </div>
  );
};

export default RecommendedProducts;
