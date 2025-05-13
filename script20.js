document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_URL = 'https://mon-api-three.vercel.app';
    const PLACEHOLDER_IMAGE = 'https://placehold.co/50';
    const DEBOUNCE_DELAY = 300;
    const ALERT_DISPLAY_TIME = 5000;
    const MIN_SEARCH_LENGTH = 2;
    const MAX_AUTOCOMPLETE_ITEMS = 5;
  
    // Éléments DOM
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('search-button');
    const resultsTable = document.querySelector('#results tbody');
    const alertDiv = document.getElementById('alert');
    const contributionForm = document.getElementById('contribution-form');
    const autocompleteBox = document.getElementById('autocomplete-results');
    const selectedProductImage = document.getElementById('selected-product-image');
    const resultsContainer = document.getElementById('results-container');
    const filterInputs = document.querySelectorAll('.filter-input');
  
    // Cache de recherche
    const searchCache = new Map();
    let currentAutocompleteIndex = -1;
  
    // Événements de recherche
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.trim();
      if (term.length >= MIN_SEARCH_LENGTH) {
        performSearch(term);
      } else {
        hideAutocomplete();
      }
    });
  
    searchButton.addEventListener('click', () => {
      const term = searchInput.value.trim();
      if (term.length >= MIN_SEARCH_LENGTH) {
        performSearch(term);
      }
    });
  
    // Autocomplétion
    function displayAutocomplete(items) {
      autocompleteBox.innerHTML = '';
      
      items.slice(0, MAX_AUTOCOMPLETE_ITEMS).forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerHTML = `
          <img src="${item.photo_url || PLACEHOLDER_IMAGE}" 
               alt="" 
               onerror="this.src='${PLACEHOLDER_IMAGE}'">
          <span>${escapeHtml(item.name)}</span>
        `;
        div.addEventListener('click', () => {
          searchInput.value = item.name;
          if (item.photo_url) {
            selectedProductImage.innerHTML = `<img src="${item.photo_url}" alt="">`;
            selectedProductImage.style.display = 'block';
          }
          hideAutocomplete();
        });
        autocompleteBox.appendChild(div);
      });
  
      autocompleteBox.style.display = items.length ? 'block' : 'none';
    }
  
    function hideAutocomplete() {
      autocompleteBox.style.display = 'none';
      currentAutocompleteIndex = -1;
    }
  
    // Recherche API
    async function performSearch(term) {
      if (searchCache.has(term)) {
        displayResults(searchCache.get(term));
        return;
      }
  
      try {
        setLoadingState(true);
        const response = await fetch(`${API_URL}/api/products/search/${encodeURIComponent(term)}`);
        
        if (!response.ok) throw new Error('Erreur de recherche');
        
        const data = await response.json();
        searchCache.set(term, data);
        displayResults(data);
        
      } catch (error) {
        showAlert(error.message, 'error');
      } finally {
        setLoadingState(false);
      }
    }
  
    // Affichage résultats
    function displayResults(data) {
      resultsTable.innerHTML = '';
      
      data.forEach(product => {
        product.alternatives?.forEach(alt => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><img src="${alt.photo_url || PLACEHOLDER_IMAGE}" alt="${escapeHtml(alt.name)}"></td>
            <td>${escapeHtml(alt.name)}</td>
            <td>${escapeHtml(alt.marque || 'Inconnue')}</td>
            <td>${getRatingIcon(alt.ban)}</td>
          `;
          resultsTable.appendChild(row);
        });
      });
  
      resultsContainer.style.display = resultsTable.children.length ? 'block' : 'none';
      updateBrandFilter(data);
    }
  
    // Filtres
    function updateBrandFilter(products) {
      const brandSelect = document.querySelector('.filter-input[data-column="2"]');
      const brands = [...new Set(
        products.flatMap(p => 
          p.alternatives?.map(a => a.marque).filter(Boolean)
        )
      )].sort();
  
      brandSelect.innerHTML = '<option value="">Toutes les marques</option>' + 
        brands.map(b => `<option value="${b}">${b}</option>`).join('');
    }
  
    filterInputs.forEach(input => {
      input.addEventListener('input', filterResults);
    });
  
    function filterResults() {
      const productFilter = document.querySelector('.filter-input[data-column="1"]').value.toLowerCase();
      const brandFilter = document.querySelector('.filter-input[data-column="2"]').value.toLowerCase();
  
      document.querySelectorAll('#results tbody tr').forEach(row => {
        const productName = row.cells[1].textContent.toLowerCase();
        const brandName = row.cells[2].textContent.toLowerCase();
        
        const matchesProduct = productName.includes(productFilter);
        const matchesBrand = brandFilter === '' || brandName === brandFilter;
        
        row.style.display = matchesProduct && matchesBrand ? '' : 'none';
      });
    }
  
    // Formulaire
    contributionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        productName: document.getElementById('product-name').value.trim(),
        altName: document.getElementById('alt-name').value.trim(),
        altDesc: document.getElementById('alt-desc').value.trim(),
        rating: document.querySelector('input[name="rating"]:checked')?.value,
        altImage: document.getElementById('alt-image').value.trim()
      };
  
      if (!validateForm(formData)) return;
  
      try {
        setFormLoadingState(true);
        const response = await fetch(`${API_URL}/api/contribute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) throw new Error('Erreur lors de l\'envoi');
        
        showAlert('Merci pour votre contribution !', 'success');
        contributionForm.reset();
        searchCache.clear();
  
      } catch (error) {
        showAlert(error.message, 'error');
      } finally {
        setFormLoadingState(false);
      }
    });
  
    // Utilitaires
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  
    function getRatingIcon(rating) {
      switch(rating) {
        case 'green': return '<i class="fas fa-thumbs-up green"></i>';
        case 'red': return '<i class="fas fa-thumbs-down red"></i>';
        default: return '<i class="fas fa-circle orange"></i>';
      }
    }
  
    function setLoadingState(isLoading) {
      searchButton.innerHTML = isLoading 
        ? '<i class="fas fa-spinner fa-spin"></i>'
        : '<i class="fas fa-search"></i>';
      searchButton.disabled = isLoading;
    }
  
    function setFormLoadingState(isLoading) {
      const submitBtn = contributionForm.querySelector('button[type="submit"]');
      submitBtn.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Envoi...'
        : '<i class="fas fa-paper-plane"></i> Soumettre';
      submitBtn.disabled = isLoading;
    }
  
    function validateForm(formData) {
      if (!formData.productName) {
        showAlert('Le nom de la marque est requis', 'warning');
        return false;
      }
      if (formData.altImage && !isValidUrl(formData.altImage)) {
        showAlert('URL d\'image invalide', 'warning');
        return false;
      }
      return true;
    }
  
    function isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch {
        return false;
      }
    }
  
    function showAlert(message, type) {
      alertDiv.textContent = message;
      alertDiv.className = `alert ${type}`;
      alertDiv.style.display = 'block';
      setTimeout(() => alertDiv.style.display = 'none', ALERT_DISPLAY_TIME);
    }
  
    // Fermeture autocomplete
    document.addEventListener('click', (e) => {
      if (!autocompleteBox.contains(e.target) && e.target !== searchInput) {
        hideAutocomplete();
      }
    });
  });