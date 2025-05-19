
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductForm from './ProductForm';

interface EditProductButtonProps {
  productId: string;
  shopId: string;
  shopName: string;
  onUpdate: () => void;
}

const EditProductButton: React.FC<EditProductButtonProps> = ({ productId, shopId, shopName, onUpdate }) => {
  const [open, setOpen] = useState(false);

  const handleComplete = () => {
    setOpen(false);
    onUpdate();
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        onClick={() => setOpen(true)}
        aria-label="Редактировать товар"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Редактировать товар</DialogTitle>
          </DialogHeader>
          <ProductForm 
            shopId={shopId}
            shopName={shopName}
            onComplete={handleComplete}
            productId={productId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditProductButton;
