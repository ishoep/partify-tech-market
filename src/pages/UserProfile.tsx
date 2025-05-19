
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProductList from '@/components/ProductList';
import { getUserProfile, getShopByUserId, getProducts, createChat } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MessageCircle, Phone, ShoppingBag, Mail, User } from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Get user data
        const userData = await getUserProfile(userId);
        if (userData) {
          setUser(userData);
          
          // Check if user has a shop
          const shopData = await getShopByUserId(userId);
          if (shopData) {
            setShop(shopData);
            
            // Get shop products (only active ones, not warehouse)
            const shopProducts = await getProducts({ 
              shopId: userId,
              status: "Active"
            });
            setProducts(shopProducts);
          }
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
          <p>Загрузка информации о пользователе...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!user) {
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
        
        
        <div className="bg-white dark:bg-black shadow-sm rounded-lg mb-6 overflow-hidden">
          <div className="bg-primary/10 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.displayName || 'Пользователь'}</h1>
                {user.bio && <p className="mt-1 text-muted-foreground">{user.bio}</p>}
                
                {shop && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => navigate(`/shop/${shop.id}`)}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {shop.name || 'Магазин пользователя'}
                    </Button>
                  </div>
                )}
              </div>
              
              {currentUser && user.id !== currentUser.uid && (
                <Button onClick={handleStartChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Написать
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User info sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.displayName || 'Не указано'}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  {user.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Products or other user info */}
          <div className="md:col-span-2">
            {shop ? (
              <Tabs defaultValue="products">
                <TabsList className="w-full grid grid-cols-1">
                  <TabsTrigger value="products">Товары ({products.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="products" className="pt-4">
                  {products.length > 0 ? (
                    <ProductList 
                      products={products} 
                      onUpdate={() => {}} 
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>У пользователя пока нет товаров</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>У этого пользователя нет магазина</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
