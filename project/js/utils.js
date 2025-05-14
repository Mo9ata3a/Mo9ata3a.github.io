/**
 * Utility functions for the application
 */

/**
 * Format a prix with the Euro currency symbol
 * @param {number|string} prix - The prix to format
 * @returns {string} - The formatted prix
 */
export function formatprix(prix) {
  if (prix === undefined || prix === null) {
    return 'Prix non disponible';
  }
  
  // Convert to number if it's a string
  const numprix = typeof prix === 'string' ? parseFloat(prix) : prix;
  
  // Check if the conversion was successful
  if (isNaN(numprix)) {
    return 'Prix non disponible';
  }
  
  // Format the prix with the Euro symbol
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'DH',
    minimumFractionDigits: 2
  }).format(numprix);
}

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate a string to a specific length and add an ellipsis
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length of the string
 * @returns {string} - The truncated string
 */
export function truncateString(str, maxLength = 50) {
  if (!str) return '';
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.slice(0, maxLength) + '...';
}
