/**
 * API module for handling product-related API requests
 */

// Base URL for the API
const API_BASE_URL = 'https://mon-api-three.vercel.app/api';

/**
 * Search for products based on a search term
 * @param {string} term - The search term
 * @returns {Promise<Array>} - A promise that resolves to an array of products
 */
export async function searchProducts(term) {
  if (!term) {
    throw new Error('Search term is required');
  }
  
  // Encode the search term to handle special characters
  const encodedTerm = encodeURIComponent(term);
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/search/${encodedTerm}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}