import { Product } from '../types';

const API_BASE_URL = 'https://mon-api-three.vercel.app/api/products/search';

export async function searchProducts(term: string): Promise<Product[]> {
  if (!term) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(term)}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}