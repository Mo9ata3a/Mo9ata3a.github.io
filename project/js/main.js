import { searchProducts } from './api.js';
import { renderProducts, showLoadingIndicator, hideLoadingIndicator, showError, showNoResults, clearResults } from './ui.js';

// DOM elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Initialize the application
function initApp() {
  // Add event listeners
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  // Set focus on search input
  searchInput.focus();
}

// Handle search event
async function handleSearch() {
  const searchTerm = searchInput.value.trim();
  
  if (!searchTerm) {
    return;
  }
  
  // Clear previous results and show loading indicator
  clearResults();
  showLoadingIndicator();
  
  try {
    // Call API to search for products
    const products = await searchProducts(searchTerm);
    
    // Hide loading indicator
    hideLoadingIndicator();
    
    // Display results or no results message
    if (products && products.length > 0) {
      renderProducts(products);
    } else {
      showNoResults();
    }
  } catch (error) {
    console.error('Error searching for products:', error);
    hideLoadingIndicator();
    showError();
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);