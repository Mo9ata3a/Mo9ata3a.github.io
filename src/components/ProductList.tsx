import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[] | null | undefined;
  loading: boolean;
  error: string | null;
}

const ProductList: React.FC<ProductListProps> = ({ products, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (!Array.isArray(products)) {
    console.warn('⚠️ products n\'est pas un tableau :', products);
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-md text-center">
        <p>Les données produits sont invalides.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-md text-center">
        <p>Aucun produit trouvé. Essayez une recherche différente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
