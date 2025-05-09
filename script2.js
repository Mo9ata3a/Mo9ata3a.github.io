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

  // Débounce pour la recherche
  const performSearch = debounce(async (term) => {
    if (term.length === 0) {
      selectedProductImage.style.display = 'none';
      selectedProductImage.innerHTML = '';
    }

    if (term.length < MIN_SEARCH_LENGTH) {
      hideAutocomplete();
      return;
    }

    if (searchCache.has(term)) {
      const cachedData = searchCache.get(term);
      displayAutocomplete(cachedData);
      displayResults(cachedData);
      return;
    }

    try {
      setLoadingState(true);
      const response = await fetch(`${API_URL}/api/products/search/${encodeURIComponent(term)}`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      searchCache.set(term, data);
      displayAutocomplete(data);
      displayResults(data);

    } catch (error) {
      showAlert(error.message || 'Erreur de connexion à l\'API', 'error');
    } finally {
      setLoadingState(false);
    }
  }, DEBOUNCE_DELAY);

  // Affichage de l'autocomplétion
  function displayAutocomplete(products) {
    const suggestions = new Map();

    products.forEach(product => {
      if (product.name) {
        suggestions.set(product.name, {
          image: product.photo_url || PLACEHOLDER_IMAGE,
          banStatus: product.ban
        });
      }
      product.alternatives?.forEach(alt => {
        if (alt.name) {
          suggestions.set(alt.name, {
            image: alt.photo_url || PLACEHOLDER_IMAGE,
            banStatus: alt.ban
          });
        }
      });
    });

    autocompleteBox.innerHTML = '';
    autocompleteBox.setAttribute('role', 'listbox');
    autocompleteBox.setAttribute('aria-label', 'Suggestions de produits');

    if (suggestions.size === 0) {
      hideAutocomplete();
      return;
    }

    Array.from(suggestions.entries())
      .slice(0, MAX_AUTOCOMPLETE_ITEMS)
      .forEach(([name, { image, banStatus }], index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        item.setAttribute('id', `autocomplete-item-${index}`);

        item.innerHTML = `
          <img src="${image}" alt="" aria-hidden="true" 
               onerror="this.src='${PLACEHOLDER_IMAGE}'">
          <span>${escapeHtml(name)}</span>
          ${getBanStatusIcon(banStatus)}
        `;

        item.addEventListener('click', () => selectAutocompleteItem(name, image));
        autocompleteBox.appendChild(item);
      });

    autocompleteBox.style.display = 'block';
    currentAutocompleteIndex = -1;
  }

  // Gestion de la sélection
  function selectAutocompleteItem(name, imageUrl) {
    searchInput.value = name;
    hideAutocomplete();
    
    if (imageUrl) {
      selectedProductImage.innerHTML = `<img src="${imageUrl}" alt="${escapeHtml(name)}">`;
      selectedProductImage.style.display = 'block';
    } else {
      selectedProductImage.style.display = 'none';
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
        if (currentAutocompleteIndex >= 0 && items[currentAutocompleteIndex]) {
          items[currentAutocompleteIndex].click();
        }
        return;
      case 'Escape':
        hideAutocomplete();
        return;
    }

    Array.from(items).forEach((item, i) => {
      item.setAttribute('aria-selected', i === currentAutocompleteIndex);
      item.classList.toggle('selected', i === currentAutocompleteIndex);
    });
  });

  // Affichage des résultats
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

  // Mise à jour des marques
  function updateBrandList(products) {
    const uniqueBrands = [...new Set(
      products.flatMap(p => 
        p.alternatives?.map(alt => alt.marque).filter(Boolean)
    )];
    
    const brandsContainer = document.getElementById('brandsContainer');
    if (brandsContainer) {
      brandsContainer.innerHTML = uniqueBrands.length > 0 
        ? uniqueBrands.map(b => `<li class="brand-item">${escapeHtml(b)}</li>`).join('')
        : '<li>Aucune marque trouvée</li>';
    }
  }

  // Gestion du formulaire
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
      showAlert(result.message || 'Contribution envoyée!', 'success');
      contributionForm.reset();
      searchCache.clear();

    } catch (error) {
      showAlert(error.message || 'Erreur d\'envoi', 'error');
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
  document.addEventListener('click', (e) => {
    if (!autocompleteBox.contains(e.target)) hideAutocomplete();
  });
  searchIcon.addEventListener('click', () => searchInput.focus());

  function hideAutocomplete() {
    autocompleteBox.style.display = 'none';
    currentAutocompleteIndex = -1;
  }
});
