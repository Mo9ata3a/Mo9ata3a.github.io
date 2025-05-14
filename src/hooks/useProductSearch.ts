import { useState, useEffect, useCallback } from 'react';
import { Product, SearchState } from '../types';
import { searchProducts } from '../utils/api';

const useProductSearch = () => {
  const [state, setState] = useState<SearchState>({
    searchTerm: '',
    category: '',
    products: [],
    loading: false,
    error: null
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(state.searchTerm);

  // Extract unique categories from products
  useEffect(() => {
    if (state.products.length > 0) {
      const uniqueCategories = Array.from(
        new Set(state.products.map(product => product.categorie))
      );
      setCategories(uniqueCategories);
    }
  }, [state.products]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(state.searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [state.searchTerm]);

  // Fetch products when debounced search term changes
  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedSearchTerm) {
        setState(prev => ({ ...prev, products: [], loading: false }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await searchProducts(debouncedSearchTerm);
        setState(prev => ({ ...prev, products: data, loading: false }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'Une erreur est survenue lors de la recherche. Veuillez réessayer.', 
          loading: false 
        }));
      }
    };

    fetchData();
  }, [debouncedSearchTerm]);

  // Set search term
  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  // Set category filter
  const setCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, category }));
  }, []);

  // Filter products by category
  const filteredProducts = state.category
    ? state.products.filter(product => product.categorie === state.category)
    : state.products;

  // Execute search immediately
  const executeSearch = useCallback(() => {
    setDebouncedSearchTerm(state.searchTerm);
  }, [state.searchTerm]);

  return {
    searchTerm: state.searchTerm,
    category: state.category,
    products: filteredProducts,
    loading: state.loading,
    error: state.error,
    categories,
    setSearchTerm,
    setCategory,
    executeSearch
  };
};

export default useProductSearch;