import React from 'react';
import { Product } from '../types';
import BanStatus from './BanStatus';
import AlternativeList from './AlternativeList';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/3 lg:w-1/4">
          {product.photo_url ? (
            <img 
              src={product.photo_url} 
              alt={product.name} 
              className="w-full h-48 sm:h-full object-cover"
            />
          ) : (
            <div className="w-full h-48 sm:h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <BanStatus status={product.ban} />
          </div>
          
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {product.categorie}
            </span>
            <span className="text-lg font-medium text-gray-900">{product.prix}€</span>
          </div>
          
          {product.alternatives && product.alternatives.length > 0 && (
            <AlternativeList alternatives={product.alternatives} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;