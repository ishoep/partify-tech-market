
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProductList from '@/components/ProductList';
import { getShopByUserId, getProducts, getUserProfile, createChat } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MessageCircle, Phone, Mail, MapPin, Truck } from 'lucide-react';

const ShopPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchShopData = async () => {
      if (!shopId) return;
      
      setLoading(true);
      try {
        // Get shop data
        const shopData = await getShopByUserId(shopId);
        if (shopData) {
          setShop(shopData);
          
          // Get shop products (exclude warehouse items)
          const shopProducts = await getProducts({ 
            shopId: shopId,
            status: 'Active' // Only get active products, not warehouse ones
          });
          setProducts(shopProducts);
          
          // Get shop owner info
          if (shopData.ownerId) {
            const ownerData = await getUserProfile(shopData.ownerId);
            setOwner(ownerData);
          }
        }
      } catch (error) {
        console.error('Error fetching shop data:', error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные магазина.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopData();
  }, [shopId, toast]);
  
  const handleStartChat = async () => {
    if (!currentUser || !shopId) return;
    
    try {
      // We need a product ID for the chat, using the first product if available
      const productId = products.length > 0 ? products[0].id : 'general';
      
      const chatId = await createChat(currentUser.uid, shopId, productId);
      
      toast({
        title: "Чат создан",
        description: "Переход в чат...",
      });
      
      navigate(`/chats/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать чат.",
      });
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <p>Загрузка информации о магазине...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!shop) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <p>Магазин не найден</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Назад</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container py-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        
        <div className="bg-white dark:bg-black shadow-sm rounded-lg mb-6 overflow-hidden">
          <div className="bg-primary/10 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback>{shop.name ? shop.name.charAt(0).toUpperCase() : 'S'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{shop.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {shop.city && (
                    <Badge variant="outline" className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {shop.city}
                    </Badge>
                  )}
                  
                  {shop.hasDelivery && (
                    <Badge variant="outline" className="flex items-center">
                      <Truck className="h-3 w-3 mr-1" />
                      Доставка
                    </Badge>
                  )}
                </div>
              </div>
              
              {currentUser && shop.ownerId !== currentUser.uid && (
                <Button onClick={handleStartChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Написать
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shop info sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Контакты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shop.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  
                  {shop.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{shop.email}</span>
                    </div>
                  )}
                  
                  {shop.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <span>{shop.city}, {shop.address}</span>
                    </div>
                  )}
                </div>
                
                {owner && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Владелец</h3>
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto flex items-center hover:bg-transparent"
                      onClick={() => navigate(`/user/${owner.id}`)}
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>
                          {owner.displayName ? owner.displayName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{owner.displayName || 'Пользователь'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {shop.description && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>О магазине</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{shop.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Products list */}
          <div className="md:col-span-2">
            <Tabs defaultValue="products">
              <TabsList className="w-full grid grid-cols-1">
                <TabsTrigger value="products">Товары ({products.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="pt-4">
                {products.length > 0 ? (
                  <ProductList products={products} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>В магазине пока нет товаров</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShopPage;
