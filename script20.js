document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const CONFIG = {
      apiUrl: 'https://mon-api-three.vercel.app',
      placeholderImage: 'https://placehold.co/50?text=...',
      debounceDelay: 300,
      minSearchLength: 2,
      maxAutocompleteItems: 8,
      alertDisplayTime: 5000
    };
  
    // Références aux éléments DOM
    const DOM = {
      searchInput: document.getElementById('search'),
      searchButton: document.getElementById('search-button'),
      autocompleteBox: document.getElementById('autocomplete-results'),
      selectedProductImage: document.getElementById('selected-product-image'),
      resultsTable: document.querySelector('#results tbody'),
      alertDiv: document.getElementById('alert'),
      contributionForm: document.getElementById('contribution-form'),
      resultsContainer: document.getElementById('results-container'),
      brandFilter: document.querySelector('.filter-input[data-column="2"]')
    };
  
    // États
    const state = {
      currentAutocompleteIndex: -1,
      searchCache: new Map(),
      lastSearchTerm: ''
    };
  
    // Initialisation
    init();
  
    function init() {
      setupEventListeners();
    }
  
    function setupEventListeners() {
      // Recherche
      DOM.searchInput.addEventListener('input', debounce(handleSearchInput, CONFIG.debounceDelay));
      DOM.searchButton.addEventListener('click', executeSearch);
      document.addEventListener('click', handleClickOutside);
  
      // Navigation clavier autocomplete
      DOM.searchInput.addEventListener('keydown', handleKeyboardNavigation);
  
      // Filtres
      document.querySelectorAll('.filter-input').forEach(input => {
        input.addEventListener('input', filterResults);
      });
  
      // Formulaire
      DOM.contributionForm.addEventListener('submit', handleFormSubmit);
    }
  
    // ==================== [AUTOCOMPLETE] ==================== //
    async function handleSearchInput(e) {
      const term = e.target.value.trim();
      state.lastSearchTerm = term;
  
      if (term.length < CONFIG.minSearchLength) {
        hideAutocomplete();
        return;
      }
  
      try {
        setLoadingState(true);
        const data = await fetchSearchResults(term);
        displayAutocomplete(data);
      } catch (error) {
        showAlert(error.message, 'error');
      } finally {
        setLoadingState(false);
      }
    }
  
    async function fetchSearchResults(term) {
      if (state.searchCache.has(term)) {
        return state.searchCache.get(term);
      }
  
      const response = await fetch(`${CONFIG.apiUrl}/api/products/search/${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error('Erreur lors de la recherche');
  
      const data = await response.json();
      state.searchCache.set(term, data);
      return data;
    }
  
    function displayAutocomplete(items) {
      DOM.autocompleteBox.innerHTML = '';
  
      const suggestions = items.flatMap(item => [
        item,
        ...(item.alternatives || [])
      ]).filter(item => item?.name);
  
      suggestions.slice(0, CONFIG.maxAutocompleteItems).forEach((item, index) => {
        const itemElement = createAutocompleteItem(item, index);
        DOM.autocompleteBox.appendChild(itemElement);
      });
  
      DOM.autocompleteBox.style.display = suggestions.length ? 'block' : 'none';
      state.currentAutocompleteIndex = -1;
    }
  
    function createAutocompleteItem(item, index) {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.dataset.index = index;
      
      div.innerHTML = `
        <img src="${item.photo_url || CONFIG.placeholderImage}" 
             alt="" 
             onerror="this.src='${CONFIG.placeholderImage}'">
        <span>${escapeHtml(item.name)}</span>
        ${getRatingBadge(item.ban)} ddd "${item.ban}"
      `;
  
      div.addEventListener('click', () => selectAutocompleteItem(item));
      return div;
    }
  
    function selectAutocompleteItem(item) {
      DOM.searchInput.value = item.name;
      updateSelectedProductImage(item.photo_url);
      hideAutocomplete();
      DOM.searchInput.focus();
    }
  
    function handleKeyboardNavigation(e) {
      const items = DOM.autocompleteBox.querySelectorAll('.autocomplete-item');
      if (!items.length) return;
  
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          state.currentAutocompleteIndex = Math.min(state.currentAutocompleteIndex + 1, items.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          state.currentAutocompleteIndex = Math.max(state.currentAutocompleteIndex - 1, -1);
          break;
        case 'Enter':
          if (state.currentAutocompleteIndex >= 0) {
            items[state.currentAutocompleteIndex].click();
          }
          return;
        case 'Escape':
          hideAutocomplete();
          return;
      }
  
      updateSelectedAutocompleteItem(items);
    }
  
    function updateSelectedAutocompleteItem(items) {
      items.forEach((item, i) => {
        item.classList.toggle('selected', i === state.currentAutocompleteIndex);
      });
      
      if (state.currentAutocompleteIndex >= 0) {
        items[state.currentAutocompleteIndex].scrollIntoView({
          block: 'nearest'
        });
      }
    }
  
    function hideAutocomplete() {
      DOM.autocompleteBox.style.display = 'none';
      state.currentAutocompleteIndex = -1;
    }
  
    // ==================== [RECHERCHE] ==================== //
    function executeSearch() {
      const term = DOM.searchInput.value.trim();
      if (term.length >= CONFIG.minSearchLength) {
        handleSearchInput({ target: { value: term } });
        displayFullResults(term);
      }
    }
  
    async function displayFullResults(term) {
      try {
        setLoadingState(true);
        const data = await fetchSearchResults(term);
        renderResults(data);
      } catch (error) {
        showAlert(error.message, 'error');
      } finally {
        setLoadingState(false);
      }
    }
  
    function renderResults(data) {
      DOM.resultsTable.innerHTML = '';
      let hasResults = false;
  
      data.forEach(product => {
        product.alternatives?.forEach(alt => {
          hasResults = true;
          const row = createResultRow(alt);
          DOM.resultsTable.appendChild(row);
        });
      });
  
      DOM.resultsContainer.style.display = hasResults ? 'block' : 'none';
      updateBrandFilter(data);
    }
  
    function createResultRow(alt) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img src="${alt.photo_url || CONFIG.placeholderImage}" 
                  alt="${escapeHtml(alt.name)}" 
                  loading="lazy"></td>
        <td>${escapeHtml(alt.name)}</td>
        <td>${escapeHtml(alt.marque || 'Inconnue')}</td>
        <td>${getRatingIcon(alt.ban)}</td>
      `;
      return row;
    }
  
    // ==================== [FILTRES] ==================== //
    function filterResults() {
      const productFilter = document.querySelector('.filter-input[data-column="1"]').value.toLowerCase();
      const brandFilter = DOM.brandFilter.value.toLowerCase();
  
      document.querySelectorAll('#results tbody tr').forEach(row => {
        const productName = row.cells[1].textContent.toLowerCase();
        const brandName = row.cells[2].textContent.toLowerCase();
        
        const matchesProduct = productName.includes(productFilter);
        const matchesBrand = brandFilter === '' || brandName === brandFilter;
        
        row.style.display = matchesProduct && matchesBrand ? '' : 'none';
      });
    }
  
    function updateBrandFilter(products) {
      const brands = [...new Set(
        products.flatMap(p => 
          p.alternatives?.map(a => a.marque).filter(Boolean)
      ))].sort();
  
      DOM.brandFilter.innerHTML = `
        <option value="">Toutes les marques</option>
        ${brands.map(b => `<option value="${b}">${b}</option>`).join('')}
      `;
    }
  
    // ==================== [FORMULAIRE] ==================== //
    async function handleFormSubmit(e) {
      e.preventDefault();
      
      const formData = {
        productName: DOM.contributionForm.querySelector('#product-name').value.trim(),
        altName: DOM.contributionForm.querySelector('#alt-name').value.trim(),
        altDesc: DOM.contributionForm.querySelector('#alt-desc').value.trim(),
        rating: DOM.contributionForm.querySelector('input[name="rating"]:checked')?.value,
        altImage: DOM.contributionForm.querySelector('#alt-image').value.trim()
      };
  
      if (!validateForm(formData)) return;
  
      try {
        setFormLoadingState(true);
        await submitFormData(formData);
        showAlert('Merci pour votre contribution !', 'success');
        DOM.contributionForm.reset();
        state.searchCache.clear();
      } catch (error) {
        showAlert(error.message, 'error');
      } finally {
        setFormLoadingState(false);
      }
    }
  
    async function submitFormData(formData) {
      const response = await fetch(`${CONFIG.apiUrl}/api/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erreur lors de l\'envoi');
      }
    }
  
    // ==================== [UTILITAIRES] ==================== //
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  
    function getRatingIcon(rating) {
        return rating === 'green' 
        ? '<i class="fas fa-thumbs-up"></i>'
        : rating === 'red' 
          ? '<i class="fas fa-thumbs-down"></i>'
          : '<i class="fas fa-circle"></i>';
    }
  
    function getRatingBadge(rating) {
      switch(rating) {
        case 'green': return '<span class="rating-badge green"><i class="fas fa-thumbs-up"></i></span>';
        case 'red': return '<span class="rating-badge red"><i class="fas fa-thumbs-down"></i></span>';
        default: return '<span class="rating-badge orange"><i class="fas fa-circle"></i></span>';
      }
    }
  
    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  
    function setLoadingState(isLoading) {
      DOM.searchButton.innerHTML = isLoading 
        ? '<i class="fas fa-spinner fa-spin"></i>'
        : '<i class="fas fa-search"></i>';
      DOM.searchButton.disabled = isLoading;
    }
  
    function setFormLoadingState(isLoading) {
      const submitBtn = DOM.contributionForm.querySelector('button[type="submit"]');
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
      DOM.alertDiv.textContent = message;
      DOM.alertDiv.className = `alert ${type}`;
      DOM.alertDiv.style.display = 'block';
      setTimeout(() => {
        DOM.alertDiv.style.display = 'none';
      }, CONFIG.alertDisplayTime);
    }
  
    function handleClickOutside(e) {
      if (!DOM.autocompleteBox.contains(e.target) && e.target !== DOM.searchInput) {
        hideAutocomplete();
      }
    }
  
    function updateSelectedProductImage(imageUrl) {
      if (imageUrl) {
        DOM.selectedProductImage.innerHTML = `
          <img src="${imageUrl}" 
               alt="Produit sélectionné" 
               onerror="this.style.display='none'">
        `;
        DOM.selectedProductImage.style.display = 'block';
      } else {
        DOM.selectedProductImage.style.display = 'none';
      }
    }
  });