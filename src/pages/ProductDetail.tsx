import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getProductById, getShopByUserId, addToFavorites, removeFromFavorites, getFavorites, createChat } from '@/lib/firebase';
import { Heart, ShoppingBag, MessageCircle, Truck, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Product {
  id: string;
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  model?: string;
  imageUrl?: string;
  shopId?: string;
  shopName?: string;
  hasDelivery?: boolean;
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
          // Явное приведение типа
          const typedProductData = productData as Product;
          setProduct(typedProductData);
          
          // Fetch shop data only if shopId exists
          if (typedProductData.shopId) {
            const shopData = await getShopByUserId(typedProductData.shopId);
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
          title: "Ошибка",
          description: "Не удалось загрузить данные товара",
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
        description: "Пожалуйста, войдите в систему",
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
          description: "Товар удален из избранного",
        });
      } else {
        await addToFavorites(currentUser.uid, productId as string);
        setIsFavorite(true);
        toast({
          title: "Успех",
          description: "Товар добавлен в избранное",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить избранное",
      });
    }
  };

  const handleStartChat = async () => {
    if (!currentUser || !product?.shopId) {
      toast({
        variant: "destructive",
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в систему",
      });
      navigate('/login');
      return;
    }
    
    if (currentUser.uid === product.shopId) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Вы не можете начать чат с собой",
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
        description: error.message || "Не удалось начать чат",
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-6">
          <p>Загрузка...</p>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="text-center py-6">
          <p>Товар не найден</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            На главную
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout compact>
      <div className="mb-3">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded overflow-hidden">
          <img
            src={product?.imageUrl || "https://placehold.co/600x400?text=Нет+фото"}
            alt={product?.name}
            className="object-contain h-full w-full max-h-[400px]"
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-left">{product?.name}</h1>
              {product?.hasDelivery && (
                <div title="Есть доставка">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-left">
              {product?.category} {product?.model ? `- ${product.model}` : ''}
            </p>
          </div>
          
          <div className="text-2xl font-bold text-left">
            {product?.price?.toLocaleString()} UZS
          </div>
          
          <Separator />
          
          {product?.description && (
            <div className="text-left">
              <h2 className="text-lg font-medium mb-2">Описание</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
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
            <div className="border rounded p-3 text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium">О продавце</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={() => navigate(`/shop/${product?.shopId}`)}
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
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
