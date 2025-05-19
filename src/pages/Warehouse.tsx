import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProductList from '@/components/ProductList';
import ProductForm from '@/components/ProductForm';
import { useAuth } from '@/context/AuthContext';
import { getProducts, getShopByUserId } from '@/lib/firebase';
import { Loader } from 'lucide-react';

interface WarehouseProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
  // Другие необходимые поля
}

const Warehouse: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [shop, setShop] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // 1. Сначала получаем данные магазина
        const shopData = await getShopByUserId(currentUser.uid);
        setShop(shopData);
        
        if (shopData) {
          // 2. Затем получаем товары на складе
          const warehouseProducts = await getProducts({ 
            shopId: currentUser.uid, // Исправлено с userId на shopId
            status: "На складе"
          });
          
          console.log("Полученные товары со склада:", warehouseProducts); // Логируем данные
          
          if (warehouseProducts && warehouseProducts.length > 0) {
            setProducts(warehouseProducts as WarehouseProduct[]);
          } else {
            console.log("На складе нет товаров");
            setProducts([]);
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных склада:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные склада",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, toast]);

  const refreshProducts = async () => {
    if (!currentUser || !shop) return;
    
    setLoading(true);
    try {
      const warehouseProducts = await getProducts({ 
        shopId: currentUser.uid,
        status: "На складе"
      });
      
      console.log("Обновленные товары:", warehouseProducts); // Логируем обновленные данные
      
      setProducts(warehouseProducts as WarehouseProduct[]);
    } catch (error) {
      console.error("Ошибка при обновлении товаров:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить список товаров",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout showSidebar>
      <div className="w-full py-4 px-2 sm:py-6">
        
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl sm:text-2xl">Склад</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {!shop ? (
              <div className="text-center py-8">
                <p className="mb-4">Для управления складом необходимо создать магазин</p>
                <Button
                  onClick={() => navigate('/shop')}
                  className="mt-2"
                >
                  Создать магазин
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Товары на складе</h3>
                  <Button 
                    onClick={() => setShowProductForm(!showProductForm)}
                    disabled={loading}
                  >
                    {showProductForm ? "Отмена" : "Добавить товар"}
                  </Button>
                </div>
                
                {showProductForm && (
                  <div className="mb-6">
                    <ProductForm 
                      shopId={currentUser?.uid || ''} 
                      shopName={shop.name}
                      onComplete={() => {
                        setShowProductForm(false);
                        refreshProducts();
                      }}
                      defaultStatus="На складе"
                    />
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ProductList 
                    products={products} 
                    onUpdate={refreshProducts} 
                    warehouseView
                    emptyMessage="На складе нет товаров"
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Warehouse;