
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { addToFavorites, removeFromFavorites, isProductInFavorites } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import EditProductButton from './EditProductButton';

interface ProductActionsProps {
  product: any;
  onUpdate: () => void;
  isOwner?: boolean;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product, onUpdate, isOwner = false }) => {
  const { currentUser: user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    const checkFavorite = async () => {
      if (user && product.id) {
        try {
          const result = await isProductInFavorites(user.uid, product.id);
          setIsFavorite(result);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };

    checkFavorite();
  }, [user, product.id]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите или зарегистрируйтесь, чтобы добавить товар в избранное",
      });
      navigate("/login");
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, product.id);
        setIsFavorite(false);
        toast({
          title: "Успех",
          description: "Товар удален из избранного",
        });
      } else {
        await addToFavorites(user.uid, product.id);
        setIsFavorite(true);
        toast({
          title: "Успех",
          description: "Товар добавлен в избранное",
        });
      }
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить избранное",
      });
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500' : ''}`}
        onClick={handleFavoriteToggle}
        aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </Button>
      
      {isOwner && (
        <EditProductButton 
          productId={product.id} 
          shopId={product.shopId || ''} 
          shopName={product.shop?.name || product.shopName || ''}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default ProductActions;
