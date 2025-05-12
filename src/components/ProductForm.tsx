
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { uploadImage } from '@/lib/imgbb';
import { createProduct } from '@/lib/firebase';

const categories = [
  "Телефоны",
  "Планшеты",
  "Ноутбуки",
  "Аксессуары"
];

interface ProductFormProps {
  shopId: string;
  shopName: string;
  onComplete: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ shopId, shopName, onComplete }) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
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
          // Попытка загрузки изображения
          imageUrl = await uploadImage(image);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Продолжаем без изображения, если загрузка не удалась
        }
      }
      
      // Create product in Firestore
      await createProduct({
        name,
        model,
        category,
        price: Number(price),
        quantity: Number(quantity),
        description,
        imageUrl,
        shopId,
        shopName,
        status: "На витрине",
        hasDelivery: false,
        createdAt: new Date(),
      });
      
      toast({
        title: "Успех",
        description: "Товар успешно добавлен.",
      });
      
      // Reset form
      setName('');
      setModel('');
      setCategory('');
      setPrice('');
      setQuantity('1');
      setDescription('');
      setImage(null);
      setImagePreview('');
      
      onComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось добавить товар.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-left block">Название*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model" className="text-left block">Модель</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-left block">Категория*</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="price" className="text-left block">Цена (UZS)*</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-left block">Количество</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image" className="text-left block">Изображение</Label>
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
                    className="max-h-32 rounded"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-left block">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
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
      </CardContent>
    </Card>
  );
};

export default ProductForm;
