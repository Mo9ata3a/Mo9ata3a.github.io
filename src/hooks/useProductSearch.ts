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
    } else {
      setCategories([]); // clear categories if no products
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
        setState(prev => ({ ...prev, products: [], loading: false, error: null }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await searchProducts(debouncedSearchTerm);
        setState(prev => ({ 
          ...prev, 
          products: Array.isArray(data) ? data : [], // sécurisation ici
          loading: false,
          error: null
        }));
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
    : state.products ?? [];

  return {
    searchTerm: state.searchTerm,
    category: state.category,
    products: filteredProducts,
    loading: state.loading,
    error: state.error,
    categories,
    setSearchTerm,
    setCategory,
    executeSearch: useCallback(() => {
      setDebouncedSearchTerm(state.searchTerm);
    }, [state.searchTerm])
  };
};

export default useProductSearch;
