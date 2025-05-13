
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProductList from '@/components/ProductList';
import { getUserProfile, getShopByUserId, getProducts, createChat } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MessageCircle, ShoppingBag, Phone, Mail } from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Get user profile
        const profile = await getUserProfile(userId);
        if (profile) {
          setUserProfile(profile);
        }
        
        // Check if user has a shop
        const shopData = await getShopByUserId(userId);
        if (shopData) {
          setShop(shopData);
          
          // Get shop products
          const shopProducts = await getProducts({ shopId: userId });
          setProducts(shopProducts);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные пользователя.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, toast]);
  
  const handleStartChat = async () => {
    if (!currentUser || !userId) return;
    
    try {
      // We need a product ID for the chat, using the first product if available
      const productId = products.length > 0 ? products[0].id : 'general';
      
      const chatId = await createChat(currentUser.uid, userId, productId);
      
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
          <p>Загрузка профиля...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!userProfile) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <p>Пользователь не найден</p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={userProfile.photoURL || ''} />
                  <AvatarFallback>
                    {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{userProfile.displayName || 'Пользователь'}</CardTitle>
                
                {shop && (
                  <Badge className="mt-2">Магазин: {shop.name}</Badge>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {userProfile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                  
                  {userProfile.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{userProfile.email}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2 pt-4">
                    {currentUser && currentUser.uid !== userId && (
                      <Button 
                        onClick={handleStartChat}
                        className="w-full"
                        variant="default"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Написать сообщение
                      </Button>
                    )}
                    
                    {shop && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/shop/${shop.id}`)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Перейти в магазин
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Content area */}
          <div className="md:col-span-2">
            <Tabs defaultValue="products">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="products">Товары</TabsTrigger>
                <TabsTrigger value="about">Информация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="pt-4">
                {products.length > 0 ? (
                  <ProductList products={products} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>У пользователя нет товаров</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="about" className="pt-4">
                {shop ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>О магазине</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">Название</h3>
                          <p>{shop.name}</p>
                        </div>
                        
                        {shop.description && (
                          <div>
                            <h3 className="font-medium">Описание</h3>
                            <p>{shop.description}</p>
                          </div>
                        )}
                        
                        {shop.address && (
                          <div>
                            <h3 className="font-medium">Адрес</h3>
                            <p>{shop.city}, {shop.address}</p>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-medium">Доставка</h3>
                          <p>{shop.hasDelivery ? 'Есть' : 'Нет'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Нет дополнительной информации</p>
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

export default UserProfile;
