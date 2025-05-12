
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateProduct, deleteProduct } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Truck, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductListProps {
  products: any[];
  onUpdate: () => void;
  warehouseView?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onUpdate,
  warehouseView = false
}) => {
  const { toast } = useToast();

  const handleMoveToShop = async (productId: string) => {
    try {
      await updateProduct(productId, {
        status: "На витрине",
      });
      
      toast({
        title: "Успех",
        description: "Товар перемещен на витрину.",
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось переместить товар.",
      });
    }
  };

  const handleMoveToWarehouse = async (productId: string) => {
    try {
      await updateProduct(productId, {
        status: "На складе",
      });
      
      toast({
        title: "Успех",
        description: "Товар перемещен на склад.",
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось переместить товар.",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      
      toast({
        title: "Успех",
        description: "Товар удален.",
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось удалить товар.",
      });
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Нет товаров</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden glass-card border-0">
          <div className="aspect-square w-full overflow-hidden">
            <img
              src={product.imageUrl || "https://placehold.co/300x300?text=Нет+фото"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <div className="text-left">
              <h3 className="font-medium truncate">{product.name}</h3>
              <p className="text-muted-foreground text-sm">
                {product.category} {product.model ? `- ${product.model}` : ''}
              </p>
              <p className="font-bold my-1">{product.price?.toLocaleString()} UZS</p>
              <p className="text-sm mb-2">
                Статус: <span className={`font-medium ${product.status === "На витрине" ? "text-green-600" : "text-amber-600"}`}>
                  {product.status}
                </span>
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link to={`/products/${product.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Просмотр
                  </Link>
                </Button>
                
                {warehouseView && product.status === "На складе" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveToShop(product.id)}
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    В магазин
                  </Button>
                ) : !warehouseView && product.status === "На витрине" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveToWarehouse(product.id)}
                  >
                    <Truck className="h-4 w-4 mr-1" rotate={180} />
                    На склад
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Товар будет удален навсегда.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductList;
