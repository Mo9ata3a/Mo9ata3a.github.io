import React from 'react';
import { Product } from '../types';
import BanStatus from './BanStatus';

interface AlternativeListProps {
  alternatives: Product[];
}

const AlternativeList: React.FC<AlternativeListProps> = ({ alternatives }) => {
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  return (
    <div className="pl-4 mt-2 border-l-2 border-gray-200">
      <h4 className="text-sm font-medium text-gray-500 mb-2">Alternatives</h4>
      <div className="space-y-2">
        {alternatives.map((alt) => (
          <div 
            key={alt.id} 
            className="flex items-center gap-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 flex-shrink-0">

  <a href={alt.photo_url} target="_blank" rel="noopener noreferrer">
   
              {alt.photo_url && (
                <img 
                  src={alt.photo_url} 
                  alt={alt.name} 
                  className="w-full h-full object-cover rounded"
                />
              )}
          </a>   </div>

              
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{alt.name}-</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{alt.categorie}</span>
                <span className="font-medium">{alt.prix}Dh</span>
                <div className="flex justify-between items-start">
                <BanStatus status={false} />
          </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternativeList;
