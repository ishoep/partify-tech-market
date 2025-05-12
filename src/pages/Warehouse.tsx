
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import ProfileSidebar from '@/components/ProfileSidebar';
import ProductList from '@/components/ProductList';
import ProductForm from '@/components/ProductForm';
import { useAuth } from '@/context/AuthContext';
import { getProducts, getShopByUserId } from '@/lib/firebase';

const Warehouse: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
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
        // Get shop information first
        const shopData = await getShopByUserId(currentUser.uid);
        setShop(shopData);
        
        if (shopData) {
          // Fetch warehouse products
          const warehouseProducts = await getProducts({ 
            userId: currentUser.uid,
            status: "На складе"
          });
          
          setProducts(warehouseProducts);
        }
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load warehouse data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, toast]);

  const refreshProducts = async () => {
    if (!currentUser) return;
    
    try {
      const warehouseProducts = await getProducts({ 
        userId: currentUser.uid,
        status: "На складе"
      });
      
      setProducts(warehouseProducts);
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
          
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-left">Склад</CardTitle>
            </CardHeader>
            <CardContent>
              {!shop ? (
                <div className="text-center py-8">
                  <p>Для управления складом необходимо создать магазин</p>
                  <Button
                    onClick={() => navigate('/shop')}
                    className="mt-4"
                  >
                    Создать магазин
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium">Товары на складе</h3>
                    <Button onClick={() => setShowProductForm(!showProductForm)}>
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
                      />
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Загрузка...</p>
                    </div>
                  ) : (
                    <ProductList 
                      products={products} 
                      onUpdate={refreshProducts} 
                      warehouseView
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Warehouse;
