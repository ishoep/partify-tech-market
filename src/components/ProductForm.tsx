
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { uploadImage } from '@/lib/imgbb';
import { createProduct } from '@/lib/firebase';
import { Switch } from '@/components/ui/switch';

// Упрощенный список категорий
const categories = [
  "Запчасти",
  "Телефоны",
  "Аксессуары"
];

interface ProductFormProps {
  shopId: string;
  shopName: string;
  onComplete: () => void;
  defaultStatus?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  shopId, 
  shopName, 
  onComplete,
  defaultStatus = "На витрине"
}) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
<<<<<<< HEAD
  const [discount, setDiscount] = useState('0');
=======
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
  const [isInStock, setIsInStock] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

<<<<<<< HEAD
  // Вычисляем финальную цену со скидкой
  const discountedPrice = price ? Math.round(Number(price) * (1 - Number(discount) / 100)) : 0;

=======
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStockToggle = (checked: boolean) => {
    setIsInStock(checked);
    if (!checked) {
      setQuantity('0');
    } else {
      setQuantity('1');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !price) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля: Название, Категория, Цена.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = '';
      
      if (image) {
        try {
          imageUrl = await uploadImage(image);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
        }
      }
<<<<<<< HEAD

      const discountPercent = Number(discount);
      const originalPrice = Number(price);
      const finalPrice = discountPercent > 0 ? 
        Math.round(originalPrice * (1 - discountPercent / 100)) : 
        originalPrice;
=======
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
      
      await createProduct({
        name,
        model,
        category,
<<<<<<< HEAD
        price: originalPrice,
        discountPercent: discountPercent,
        discountedPrice: finalPrice,
=======
        price: Number(price),
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
        quantity: Number(quantity),
        description,
        imageUrl,
        shopId,
        shopName,
        status: isInStock ? defaultStatus : "Нет в наличии",
        hasDelivery: false,
        createdAt: new Date(),
      });
      
      toast({
        title: "Успех",
        description: "Товар добавлен",
      });
      
      // Reset form
      setName('');
      setModel('');
      setCategory('');
      setPrice('');
<<<<<<< HEAD
      setDiscount('0');
=======
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
      setIsInStock(true);
      setQuantity('1');
      setDescription('');
      setImage(null);
      setImagePreview('');
      
      onComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось добавить товар",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name" className="text-left block mb-1">Название*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="model" className="text-left block mb-1">Модель</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="category" className="text-left block mb-1">Категория*</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="price" className="text-left block mb-1">Цена (UZS)*</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              required
            />
          </div>
<<<<<<< HEAD

          <div>
            <Label htmlFor="discount" className="text-left block mb-1">Скидка (%)</Label>
            <Input
              id="discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min={0}
              max={99}
            />
            {Number(discount) > 0 && Number(price) > 0 && (
              <div className="mt-1 text-sm text-muted-foreground text-left">
                Итоговая цена: <span className="font-medium">{discountedPrice} UZS</span>
              </div>
            )}
          </div>
=======
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="stock-status" 
              checked={isInStock} 
              onCheckedChange={handleStockToggle}
            />
            <Label htmlFor="stock-status">В наличии</Label>
          </div>
          
          <div>
            <Label htmlFor="quantity" className="text-left block mb-1">Количество</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={0}
              disabled={!isInStock}
            />
          </div>
          
          <div>
            <Label htmlFor="image" className="text-left block mb-1">Изображение</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-24 rounded"
                />
              </div>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="description" className="text-left block mb-1">Описание</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Добавление..." : "Добавить товар"}
        </Button>
      </form>
    </div>
  );
};

export default ProductForm;
