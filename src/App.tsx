import React from 'react';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import useProductSearch from './hooks/useProductSearch';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MessageSquareHeart } from 'lucide-react';

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
	  <Header />
      
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
	   {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Trouvez le produit idéal en quelques clics
              </h1>
              {/* <p className="text-blue-100 text-lg mb-8">
                Notre moteur de recherche avancé vous aide à trouver rapidement ce que vous cherchez.
              </p> */}
              {/* <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-md hover:shadow-lg">
                  Commencer
                </button>
                <button className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition-colors duration-300">
                  En savoir plus
                </button>
              </div> */}
            </div>
          </div>
        </section>
	  
	  
	  
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
		
		  {/* Feedback CTA */}
       {/*  <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre opinion compte</h2>
                  <p className="text-gray-600">
                    Aidez-nous à améliorer notre service en partageant votre expérience
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-md">
                    <MessageSquareHeart className="mr-2 h-5 w-5" />
                    Donnez votre avis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section> */}
		
		
      </main>
	   <Footer />
    </div>
  );
}

export default App;