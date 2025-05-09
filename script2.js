document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://mon-api-three.vercel.app';
  const searchInput = document.getElementById('search');
  const resultsTable = document.querySelector('#results tbody');
  const resultsContainer = document.getElementById('results-container');
  const alertDiv = document.getElementById('alert');
  const contributionForm = document.getElementById('contribution-form');
  const autocompleteBox = document.getElementById('autocomplete-results');
  const searchIcon = document.getElementById('search-icon');
  const PLACEHOLDER_IMAGE = 'https://placehold.co/50';
  const selectedProductImage = document.getElementById('selected-product-image');

  // Configuration
  const searchCache = new Map();
  const DEBOUNCE_DELAY = 300;
  const ALERT_DISPLAY_TIME = 5000;
  const MIN_SEARCH_LENGTH = 2;
  const MAX_AUTOCOMPLETE_ITEMS = 5;
  let currentAutocompleteIndex = -1;

  // Éléments du formulaire
  const formElements = {
    productName: document.getElementById('product-name'),
    altName: document.getElementById('alt-name'),
    altDesc: document.getElementById('alt-desc'),
    altImage: document.getElementById('alt-image'),
    submitBtn: contributionForm.querySelector('button')
  };

  // Gestion de la recherche
  const performSearch = debounce(async (term) => {
    term = term.trim();
    
    if (term.length < MIN_SEARCH_LENGTH) {
      hideAutocomplete();
      return;
    }

    if (searchCache.has(term)) {
      displayAutocomplete(searchCache.get(term));
      return;
    }

    try {
      setLoadingState(true);
      const response = await fetch(`${API_URL}/api/products/search/${encodeURIComponent(term)}`);
      
      if (!response.ok) throw new Error(`Statut HTTP: ${response.status}`);
      
      const data = await response.json();
      searchCache.set(term, data);
      displayAutocomplete(data);

    } catch (error) {
      showAlert(error.message || 'Erreur de connexion', 'error');
    } finally {
      setLoadingState(false);
    }
  }, DEBOUNCE_DELAY);

  // Affichage autocomplétion
  function displayAutocomplete(products) {
    autocompleteBox.innerHTML = '';
    autocompleteBox.setAttribute('role', 'listbox');
    autocompleteBox.setAttribute('aria-label', 'Suggestions');

    const suggestions = products.flatMap(product => [
      product,
      ...(product.alternatives || [])
    ]).filter(item => item.name);

    suggestions.slice(0, MAX_AUTOCOMPLETE_ITEMS).forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.setAttribute('role', 'option');
      div.setAttribute('id', `ac-${index}`);
      div.setAttribute('aria-selected', 'false');
      
      div.innerHTML = `
        <img src="${item.photo_url || PLACEHOLDER_IMAGE}" 
             alt="" 
             class="autocomplete-img"
             onerror="this.src='${PLACEHOLDER_IMAGE}'">
        <span>${escapeHtml(item.name)}</span>
        ${getBanStatusIcon(item.ban)}
      `;

      div.addEventListener('click', () => selectAutocompleteItem(item));
      autocompleteBox.appendChild(div);
    });

    autocompleteBox.style.display = suggestions.length ? 'block' : 'none';
  }

  // Sélection item
  function selectAutocompleteItem(item) {
    searchInput.value = item.name;
    hideAutocomplete();
    
    if (item.photo_url) {
      selectedProductImage.innerHTML = `
        <img src="${item.photo_url}" 
             alt="${escapeHtml(item.name)}" 
             onerror="this.style.display='none'">
      `;
      selectedProductImage.style.display = 'block';
    }
    
    searchInput.focus();
  }

  // Navigation clavier
  searchInput.addEventListener('keydown', (e) => {
    const items = autocompleteBox.children;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentAutocompleteIndex = Math.min(currentAutocompleteIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        currentAutocompleteIndex = Math.max(currentAutocompleteIndex - 1, -1);
        break;
      case 'Enter':
        if (currentAutocompleteIndex >= 0) items[currentAutocompleteIndex].click();
        return;
      case 'Escape':
        hideAutocomplete();
        return;
    }

    Array.from(items).forEach((item, i) => {
      item.classList.toggle('selected', i === currentAutocompleteIndex);
      item.setAttribute('aria-selected', i === currentAutocompleteIndex);
    });
  });

  // Affichage résultats
  function displayResults(products) {
    resultsTable.innerHTML = '';
    let hasResults = false;

    products.forEach(product => {
      product.alternatives?.forEach(alt => {
        hasResults = true;
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <img src="${alt.photo_url || PLACEHOLDER_IMAGE}" 
                 alt="${escapeHtml(alt.name)}" 
                 loading="lazy">
          </td>
          <td>${escapeHtml(alt.name)}</td>
          <td>${alt.marque || 'Non spécifié'}</td>
          <td aria-label="Statut: ${alt.ban}">${getRatingIcon(alt.ban)}</td>
        `;
        resultsTable.appendChild(row);
      });
    });

    resultsContainer.style.display = hasResults ? 'block' : 'none';
    updateBrandList(products);
  }

  // Mise à jour marques
  function updateBrandList(products) {
    const brandsContainer = document.getElementById('brandsContainer');
    if (!brandsContainer) return;

    const brands = [...new Set(
      products.flatMap(p => 
        p.alternatives?.map(a => a.marque).filter(Boolean)
      )
    )];

    brandsContainer.innerHTML = brands.length 
      ? brands.map(b => `<li>${escapeHtml(b)}</li>`).join('')
      : '<li>Aucune marque trouvée</li>';
  }

  // Formulaire
  contributionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      productName: formElements.productName.value.trim(),
      altName: formElements.altName.value.trim(),
      altDesc: formElements.altDesc.value.trim(),
      rating: contributionForm.querySelector('input[name="rating"]:checked')?.value,
      altImage: formElements.altImage.value.trim()
    };

    if (!validateForm(formData)) return;

    try {
      setFormLoadingState(true);
      const response = await fetch(`${API_URL}/api/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await parseResponse(response);
      showAlert(result.message || 'Merci pour votre contribution !', 'success');
      contributionForm.reset();
      searchCache.clear();

    } catch (error) {
      showAlert(error.message || 'Erreur lors de l\'envoi', 'error');
    } finally {
      setFormLoadingState(false);
    }
  });

  // Fonctions utilitaires
  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  function getBanStatusIcon(banStatus) {
    return banStatus === false 
      ? '<i class="fas fa-thumbs-up green-icon" aria-hidden="true"></i>'
      : banStatus === true 
        ? '<i class="fas fa-thumbs-down red-icon" aria-hidden="true"></i>'
        : '<i class="fas fa-circle orange-icon" aria-hidden="true"></i>';
  }

  function getRatingIcon(rating) {
    return rating === 'green' 
      ? '<i class="fas fa-thumbs-up"></i>'
      : rating === 'red' 
        ? '<i class="fas fa-thumbs-down"></i>'
        : '<i class="fas fa-circle"></i>';
  }

  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  function setLoadingState(isLoading) {
    searchIcon.innerHTML = isLoading 
      ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>'
      : '<i class="fas fa-search" aria-hidden="true"></i>';
  }

  function setFormLoadingState(isLoading) {
    formElements.submitBtn.disabled = isLoading;
    formElements.submitBtn.innerHTML = isLoading
      ? '<i class="fas fa-spinner fa-spin"></i> Envoi...'
      : '<i class="fas fa-paper-plane"></i> Soumettre';
  }

  function validateForm(formData) {
    if (!formData.productName) {
      showAlert('Nom du produit requis', 'warning');
      return false;
    }
    if (!formData.altName) {
      showAlert('Nom de l\'alternative requis', 'warning');
      return false;
    }
    if (formData.altImage && !isValidUrl(formData.altImage)) {
      showAlert('URL d\'image invalide', 'warning');
      return false;
    }
    return true;
  }

  async function parseResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur serveur');
    }
    return response.json();
  }

  function isValidUrl(string) {
    try { return Boolean(new URL(string)); } 
    catch { return false; }
  }

  function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.display = 'block';
    setTimeout(() => alertDiv.style.display = 'none', ALERT_DISPLAY_TIME);
  }

  // Événements
  searchInput.addEventListener('input', (e) => performSearch(e.target.value.trim()));
  document.addEventListener('click', (e) => !autocompleteBox.contains(e.target) && hideAutocomplete());
  searchIcon.addEventListener('click', () => searchInput.focus());

  function hideAutocomplete() {
    autocompleteBox.style.display = 'none';
    currentAutocompleteIndex = -1;
  }
});
