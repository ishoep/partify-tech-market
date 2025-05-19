
import React from 'react';
import ProductList from './ProductList';
import { useAuth } from '@/context/AuthContext';
import ProductActions from './ProductActions';

interface ProductListWrapperProps {
  products: any[];
  onUpdate: () => void;
  showDeliveryBadge?: boolean;
  emptyMessage?: string;
  viewMode?: "grid" | "list";
  showActions?: boolean;
}

const ProductListWrapper: React.FC<ProductListWrapperProps> = (props) => {
  const { currentUser: user } = useAuth();
  const { products, onUpdate } = props;
  
  // Add custom actions to products
  const enhancedProducts = products.map(product => {
    const isOwner = user && (
      (product.shopId && user.uid === product.shopId) || 
      (product.userId && user.uid === product.userId)
    );
    
    return {
      ...product,
      customActions: props.showActions ? (
        <ProductActions 
          product={product} 
          onUpdate={onUpdate} 
          isOwner={isOwner}
        />
      ) : null
    };
  });

  return (
    <ProductList
      {...props}
      products={enhancedProducts}
    />
  );
};

export default ProductListWrapper;
