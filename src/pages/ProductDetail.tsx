
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getProductById, getShopByUserId, addToFavorites, removeFromFavorites, getFavorites, createChat } from '@/lib/firebase';
import { Heart, ShoppingBag, MessageCircle, Truck, ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  model?: string;
  imageUrl?: string;
  shopId: string;
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const productData = await getProductById(productId);
        
        if (productData) {
          setProduct(productData as Product);
          
          // Fetch shop data
          if (productData.shopId) {
            const shopData = await getShopByUserId(productData.shopId);
            setShop(shopData);
          }
          
          // Check if product is in favorites
          if (currentUser) {
            const favorites = await getFavorites(currentUser.uid);
            const isFav = favorites.some((fav: any) => fav.id === productId);
            setIsFavorite(isFav);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Товар не найден.",
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, currentUser, navigate, toast]);

  const handleAddToFavorites = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в систему, чтобы добавить товар в избранное.",
      });
      navigate('/login');
      return;
    }
    
    try {
      if (isFavorite) {
        await removeFromFavorites(currentUser.uid, productId as string);
        setIsFavorite(false);
        toast({
          title: "Успех",
          description: "Товар удален из избранного.",
        });
      } else {
        await addToFavorites(currentUser.uid, productId as string);
        setIsFavorite(true);
        toast({
          title: "Успех",
          description: "Товар добавлен в избранное.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить избранное.",
      });
    }
  };

  const handleStartChat = async () => {
    if (!currentUser || !product) {
      toast({
        variant: "destructive",
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в систему, чтобы связаться с продавцом.",
      });
      navigate('/login');
      return;
    }
    
    if (currentUser.uid === product.shopId) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Вы не можете начать чат с собой.",
      });
      return;
    }
    
    try {
      const chatId = await createChat(
        currentUser.uid, 
        product.shopId,
        productId as string
      );
      
      navigate(`/chats/${chatId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось начать чат.",
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p>Загрузка...</p>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p>Товар не найден</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            На главную
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-lg overflow-hidden">
          <img
            src={product?.imageUrl || "https://placehold.co/600x400?text=Нет+фото"}
            alt={product?.name}
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-left">{product?.name}</h1>
              {shop?.hasDelivery && (
                <div title="Есть доставка">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-left">
              {product?.category} {product?.model ? `- ${product.model}` : ''}
            </p>
          </div>
          
          <div className="text-2xl font-bold text-left">
            {product?.price?.toLocaleString()} UZS
          </div>
          
          {product?.description && (
            <div className="text-left">
              <h2 className="text-lg font-medium mb-2">Описание</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAddToFavorites}>
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'В избранном' : 'В избранное'}
            </Button>
            
            <Button variant="outline" onClick={handleStartChat}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Связаться с продавцом
            </Button>
          </div>
          
          {shop && (
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-medium">О продавце</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                    onClick={() => navigate(`/shops/${product?.shopId}`)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    В магазин
                  </Button>
                </div>
                
                <div className="text-sm space-y-1">
                  <p className="font-medium">{shop.name}</p>
                  <p>Телефон: {shop.phone}</p>
                  {shop.address && <p>Адрес: {shop.address}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
