/**
 * UI module for handling the rendering of products and UI state
 */
import { formatprix } from './utils.js';

// DOM elements
const resultsContainer = document.getElementById('results-container');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const noResultsMessage = document.getElementById('no-results');

/**
 * Render a list of products to the results container
 * @param {Array} products - The array of products to render
 */
export function renderProducts(products) {
  // Clear previous results
  clearResults();
  
  // Create a document fragment to improve performance
  const fragment = document.createDocumentFragment();
  
  // Create a product card for each product
  products.forEach(product => {
    const productCard = createProductCard(product);
    fragment.appendChild(productCard);
  });
  
  // Append all product cards to the results container
  resultsContainer.appendChild(fragment);
}

/**
 * Create a product card element
 * @param {Object} product - The product data
 * @returns {HTMLElement} - The product card element
 */
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  // Create the product image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image-container';
  
  // Create the product image
  const image = document.createElement('img');
  image.className = 'product-image';
  image.src = product.photo_url || 'https://via.placeholder.com/300x200?text=Image+non+disponible';
  image.alt = product.name;
  image.onerror = () => {
    image.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
  };
  
  imageContainer.appendChild(image);
  card.appendChild(imageContainer);
  
  // Create the product details container
  const details = document.createElement('div');
  details.className = 'product-details';
  
  // Add product name
  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = product.name;
  details.appendChild(name);
  
  // Add product prix
  const prix = document.createElement('div');
  prix.className = 'product-prix';
  prix.textContent = formatprix(product.prix);
  details.appendChild(prix);
  
  // Add product category
  if (product.categorie) {
    const category = document.createElement('div');
    category.className = 'product-category';
    category.textContent = product.categorie;
    details.appendChild(category);
  }
  
  // Add product ban status
  const status = document.createElement('div');
  status.className = 'product-status';
  
  // Create the appropriate icon based on ban status
  const statusIcon = document.createElement('span');
  statusIcon.className = 'status-icon';
  
  if (product.ban === true) {
    statusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="thumbs-down"><path d="M17 14V2"></path><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path></svg>`;
    status.appendChild(statusIcon);
    status.appendChild(document.createTextNode('Non recommandé'));
  } else if (product.ban === false) {
    statusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="thumbs-up"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path></svg>`;
    status.appendChild(statusIcon);
    status.appendChild(document.createTextNode('Recommandé'));
  } else {
    statusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="circle"><circle cx="12" cy="12" r="10"></circle></svg>`;
    status.appendChild(statusIcon);
    status.appendChild(document.createTextNode('Statut indéterminé'));
  }
  
  details.appendChild(status);
  
  // Add product alternatives if they exist
  if (product.alternatives && product.alternatives.length > 0) {
    const alternativesSection = createAlternativesSection(product.alternatives);
    details.appendChild(alternativesSection);
  }
  
  card.appendChild(details);
  
  return card;
}

/**
 * Create the alternatives section for a product
 * @param {Array} alternatives - The array of alternative products
 * @returns {HTMLElement} - The alternatives section element
 */
function createAlternativesSection(alternatives) {
  const section = document.createElement('div');
  section.className = 'alternatives-section';
  
  const title = document.createElement('h3');
  title.className = 'alternatives-title';
  title.textContent = 'Alternatives';
  section.appendChild(title);
  
  const container = document.createElement('div');
  container.className = 'alternatives-container';
  
  alternatives.forEach(alt => {
    const item = document.createElement('div');
    item.className = 'alternative-item';
    
    // Create the alternative image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'alternative-image-container';
    
    // Create the alternative image
    const image = document.createElement('img');
    image.className = 'alternative-image';
    image.src = alt.photo_url || 'https://via.placeholder.com/100x80?text=No+Image';
    image.alt = alt.name;
    image.onerror = () => {
      image.src = 'https://via.placeholder.com/100x80?text=No+Image';
    };
    
    imageContainer.appendChild(image);
    item.appendChild(imageContainer);
    
    // Create the alternative details
    const details = document.createElement('div');
    details.className = 'alternative-details';
    
    // Add alternative name
    const name = document.createElement('div');
    name.className = 'alternative-name';
    name.textContent = alt.name;
    details.appendChild(name);
    
    // Add alternative prix
    const prix = document.createElement('div');
    prix.className = 'alternative-prix';
    prix.textContent = formatprix(alt.prix);
    details.appendChild(prix);
    
    item.appendChild(details);
    container.appendChild(item);
  });
  
  section.appendChild(container);
  return section;
}

/**
 * Show the loading indicator
 */
export function showLoadingIndicator() {
  loadingIndicator.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  noResultsMessage.classList.add('hidden');
}

/**
 * Hide the loading indicator
 */
export function hideLoadingIndicator() {
  loadingIndicator.classList.add('hidden');
}

/**
 * Show an error message
 */
export function showError() {
  errorMessage.classList.remove('hidden');
  loadingIndicator.classList.add('hidden');
  noResultsMessage.classList.add('hidden');
}

/**
 * Show a message when no results are found
 */
export function showNoResults() {
  noResultsMessage.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  loadingIndicator.classList.add('hidden');
}

/**
 * Clear all results from the results container
 */
export function clearResults() {
  resultsContainer.innerHTML = '';
  errorMessage.classList.add('hidden');
  noResultsMessage.classList.add('hidden');
}