import React from 'react';
import { Product } from '../types';
import BanStatus from './BanStatus';
import AlternativeList from './AlternativeList';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  if (!product) return null;
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/3 lg:w-1/4">
        <div className="relative w-full sm:w-1/3 lg:w-1/4">
  {product.ban && (
    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
      Boycott
    </div>
  )} 
       {product.ban===false && (
  <div className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded z-10 flex items-center space-x-1 bg-transparent">
    <img
      src="https://badayli.com/static/media/verified.2047171bd61ad952e1f1f091f5b34cc9.svg"
      alt="Verified"
      title="Bien"
      className="w-10 h-10"
    />
    <span>Non boycotté</span>
  </div>
)}

        
        
        
        
        </div>
          {product.photo_url ? (
            <img 
              src={product.photo_url} 
              alt={product.name} 
              className="w-full h-48 sm:h-full object-contain"
            />
          ) : (
            <div className="w-full h-48 sm:h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">{product.article}</h3>
            <BanStatus status={product.ban} />
          </div>
          
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {product.categorie}
            </span>
            <span className="text-lg font-medium text-gray-900">{product.prix}Dh</span>
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
