import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Truck, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { addToFavorites, removeFromFavorites, isProductInFavorites } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

interface ProductListProps {
  products: any[];
  onUpdate: () => void;
  showDeliveryBadge?: boolean;
  showActions?: boolean;
  warehouseView?: boolean;  // Add this prop to the interface
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onUpdate, 
  showDeliveryBadge = false,
  showActions = true,
  warehouseView = false  // Set default value to false
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };
  
  const handleEditProduct = (productId: string) => {
    // Navigate to edit product page
    navigate(`/products/edit/${productId}`);
  };
  
  const handleToggleFavorite = async (product: any) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Войдите в систему, чтобы добавить товар в избранное."
      });
      return;
    }
    
    try {
      const isInFavorites = await isProductInFavorites(currentUser.uid, product.id);
      
      if (isInFavorites) {
        await removeFromFavorites(currentUser.uid, product.id);
        toast({
          title: "Успех",
          description: "Товар удален из избранного."
        });
      } else {
        await addToFavorites(currentUser.uid, product.id);
        toast({
          title: "Успех",
          description: "Товар добавлен в избранное."
        });
      }
      
      // Refresh product list
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить избранное."
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div 
            className="h-40 bg-gray-200 cursor-pointer" 
            onClick={() => handleViewProduct(product.id)}
          >
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          
          <CardHeader className="p-3">
            <div className="flex justify-between">
              <CardTitle 
                className="text-lg font-medium cursor-pointer truncate"
                onClick={() => handleViewProduct(product.id)}
              >
                {product.name}
              </CardTitle>
            </div>
            <div className="flex gap-1 flex-wrap mt-1">
              <Badge variant="outline">
                {product.category || 'Без категории'}
              </Badge>
              {product.city && (
                <Badge variant="secondary">
                  {product.city}
                </Badge>
              )}
              {showDeliveryBadge && product.hasDelivery && (
                <Badge variant="default" className="bg-green-500">
                  <Truck className="h-3 w-3 mr-1" /> Доставка
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-3 pt-0">
            <p className="text-muted-foreground text-sm line-clamp-2">
              {product.description || 'Нет описания'}
            </p>
            <p className="font-bold mt-2">
              {product.price ? `${product.price} сум` : 'Цена не указана'}
            </p>
          </CardContent>
          
          {showActions && (
            <CardFooter className="p-3 pt-0 flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewProduct(product.id)}
              >
                Подробнее
              </Button>
              
              {currentUser && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleToggleFavorite(product)}
                >
                  <Heart 
                    className={`h-4 w-4 ${product.isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ProductList;
