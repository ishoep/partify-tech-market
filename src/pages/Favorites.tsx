
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getFavorites, removeFromFavorites } from '@/lib/firebase';
import { Heart, Truck, ArrowLeft } from 'lucide-react';

const Favorites: React.FC = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const userFavorites = await getFavorites(currentUser.uid);
        setFavorites(userFavorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load favorites",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser, toast]);

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      await removeFromFavorites(currentUser?.uid as string, productId);
      
      // Update favorites list
      const updatedFavorites = favorites.filter(product => product.id !== productId);
      setFavorites(updatedFavorites);
      
      toast({
        title: "Успех",
        description: "Товар удален из избранного.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось удалить товар из избранного.",
      });
    }
  };

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
      
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold">Избранное</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Загрузка...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">😢</div>
          <h3 className="text-xl font-medium">В избранном пусто</h3>
          <p className="text-muted-foreground mb-6">
            Вы еще не добавили товары в избранное
          </p>
          <Button onClick={() => navigate('/')}>
            Перейти к поиску
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((product) => (
            <Card key={product.id} className="overflow-hidden glass-card border-0">
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={product.imageUrl || "https://placehold.co/300x300?text=Нет+фото"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="text-left">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-medium truncate hover:underline">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm truncate">
                    {product.category} {product.model ? `- ${product.model}` : ''}
                  </p>
                  <p className="font-bold my-1">
                    {product.price?.toLocaleString()} UZS
                  </p>
                  
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
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => handleRemoveFromFavorites(product.id)}
                  >
                    <Heart className="h-4 w-4 mr-2 fill-current" />
                    Удалить из избранного
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default Favorites;
