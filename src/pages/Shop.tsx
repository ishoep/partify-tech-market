
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProfileSidebar from '@/components/ProfileSidebar';
import ProductList from '@/components/ProductList';
import ProductForm from '@/components/ProductForm';
import { useAuth } from '@/context/AuthContext';
import { createShop, getShopByUserId, updateShop, getProducts } from '@/lib/firebase';

const Shop: React.FC = () => {
  const { currentUser } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Shop form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [hasDelivery, setHasDelivery] = useState(false);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const shopData = await getShopByUserId(currentUser.uid);
        
        if (shopData) {
          setShop(shopData);
          // Fill form fields with shop data
          setName(shopData.name || '');
          setPhone(shopData.phone || '');
          setEmail(shopData.email || currentUser.email || '');
          setTelegram(shopData.telegram || '');
          setWebsite(shopData.website || '');
          setDescription(shopData.description || '');
          setAddress(shopData.address || '');
          setHasDelivery(shopData.hasDelivery || false);
          
          // Fetch shop products
          const shopProducts = await getProducts({ shopId: currentUser.uid });
          setProducts(shopProducts);
        }
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [currentUser]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !email || !address) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля: Название, Телефон, Email, Адрес.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const shopData = {
        name,
        phone,
        email,
        telegram,
        website,
        description,
        address,
        hasDelivery,
      };
      
      await createShop(currentUser?.uid as string, shopData);
      
      toast({
        title: "Успех",
        description: "Магазин успешно создан.",
      });
      
      setShop({ id: currentUser?.uid, ...shopData });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось создать магазин.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !email || !address) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля: Название, Телефон, Email, Адрес.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const shopData = {
        name,
        phone,
        email,
        telegram,
        website,
        description,
        address,
        hasDelivery,
      };
      
      await updateShop(currentUser?.uid as string, shopData);
      
      toast({
        title: "Успех",
        description: "Информация о магазине обновлена.",
      });
      
      setShop({ ...shop, ...shopData });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить информацию о магазине.",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    if (!currentUser) return;
    
    try {
      const shopProducts = await getProducts({ shopId: currentUser.uid });
      setProducts(shopProducts);
    } catch (error) {
      console.error("Error refreshing products:", error);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64">
          <ProfileSidebar />
        </div>
        
        <div className="flex-1">
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              Назад
            </Button>
          </div>
          
          {!shop ? (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-left">Создание магазина</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateShop} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-left block">Название магазина*</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-left block">Телефон*</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 XX XXX XX XX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-left block">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram" className="text-left block">Telegram</Label>
                    <Input
                      id="telegram"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-left block">Веб-сайт</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-left block">Адрес*</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-left block">Описание</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Описание вашего магазина..."
                      rows={4}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Создание..." : "Создать магазин"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-left">Управление магазином</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info">Информация</TabsTrigger>
                    <TabsTrigger value="address">Адреса</TabsTrigger>
                    <TabsTrigger value="products">Товары</TabsTrigger>
                    <TabsTrigger value="delivery">Доставка</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="pt-4">
                    <form onSubmit={handleUpdateShop} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-left block">Название магазина*</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-left block">Телефон*</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+998 XX XXX XX XX"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-left block">Email*</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telegram" className="text-left block">Telegram</Label>
                        <Input
                          id="telegram"
                          value={telegram}
                          onChange={(e) => setTelegram(e.target.value)}
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-left block">Веб-сайт</Label>
                        <Input
                          id="website"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-left block">Описание</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Описание вашего магазина..."
                          rows={4}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Обновление..." : "Обновить информацию"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="address" className="pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-left block">Адрес*</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        onClick={handleUpdateShop}
                        disabled={loading}
                      >
                        {loading ? "Обновление..." : "Обновить адрес"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="products" className="pt-4">
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="text-lg font-medium">Товары магазина</h3>
                      <Button onClick={() => setShowProductForm(!showProductForm)}>
                        {showProductForm ? "Отмена" : "Добавить товар"}
                      </Button>
                    </div>
                    
                    {showProductForm && (
                      <div className="mb-6">
                        <ProductForm 
                          shopId={currentUser?.uid || ''} 
                          shopName={name}
                          onComplete={() => {
                            setShowProductForm(false);
                            refreshProducts();
                          }}
                        />
                      </div>
                    )}
                    
                    <ProductList 
                      products={products} 
                      onUpdate={refreshProducts} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="delivery" className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Switch
                          id="hasDelivery"
                          checked={hasDelivery}
                          onCheckedChange={setHasDelivery}
                        />
                        <Label htmlFor="hasDelivery">Есть доставка</Label>
                      </div>
                      
                      <Button
                        onClick={handleUpdateShop}
                        disabled={loading}
                      >
                        {loading ? "Обновление..." : "Сохранить настройки"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Shop;
