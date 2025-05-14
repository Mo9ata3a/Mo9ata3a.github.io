import React from 'react';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import useProductSearch from './hooks/useProductSearch';

function App() {
  const { 
    searchTerm, 
    category, 
    products, 
    loading, 
    error, 
    categories,
    setSearchTerm, 
    setCategory,
    executeSearch
  } = useProductSearch();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">Recherche de Produits</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <SearchBar 
          searchTerm={searchTerm}
          category={category}
          categories={categories}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategory}
          onSubmit={executeSearch}
        />
        
        <ProductList 
          products={products}
          loading={loading}
          error={error}
        />
        
        {!loading && !error && products.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;