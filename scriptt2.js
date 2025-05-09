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

  // Configuration originale
  const searchCache = new Map();
  const DEBOUNCE_DELAY = 300;
  const ALERT_DISPLAY_TIME = 5000;
  const MIN_SEARCH_LENGTH = 2;
  const MAX_AUTOCOMPLETE_ITEMS = 5;
  let currentAutocompleteIndex = -1;

  // Éléments du formulaire (version originale)
  const formElements = {
    productName: document.getElementById('product-name'),
    altName: document.getElementById('alt-name'),
    altDesc: document.getElementById('alt-desc'),
    rating: contributionForm.querySelector('input[name="rating"]:checked'),
    altImage: document.getElementById('alt-image'),
    submitBtn: contributionForm.querySelector('button')
  };

  // Recherche avec debounce (version originale améliorée)
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
      if (data.error) {
        showAlert(data.error, 'warning');
        return;
      }

      searchCache.set(term, data);
      displayAutocomplete(data);
      displayResults(data);

    } catch (error) {
      console.error('Search error:', error);
      showAlert('Erreur de connexion à l\'API', 'error');
    } finally {
      setLoadingState(false);
    }
  }, DEBOUNCE_DELAY);

  // Gestion de l'autocomplétion (version originale + accessibilité)
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
          <img src="${image}" alt="${escapeHtml(name)}" 
               onerror="this.src='${PLACEHOLDER_IMAGE}'" 
               class="autocomplete-img">
          <span class="autocomplete-name">${escapeHtml(name)}</span>
          <span class="ban-status-icon">${getBanStatusIcon(banStatus)}</span>
        `;

        item.addEventListener('click', () => selectAutocompleteItem(name, image));
        autocompleteBox.appendChild(item);
      });

    autocompleteBox.style.display = 'block';
    currentAutocompleteIndex = -1;
  }

  // Fonctions originales conservées
  function getBanStatusIcon(banStatus) {
    if (banStatus === false) {
      return '<i class="fas fa-thumbs-up green-icon" title="Produit autorisé"></i>';
    } else if (banStatus === true) {
      return '<i class="fas fa-thumbs-down red-icon" title="Produit interdit"></i>';
    } else {
      return '<i class="fas fa-circle orange-icon" title="Statut inconnu"></i>';
    }
  }

  function getRatingIcon(rating) {
    const icons = {
      green: '<i class="fas fa-thumbs-up"></i> Good',
      orange: '<i class="fas fa-circle"></i> UNKNOWN',
      red: '<i class="fas fa-thumbs-down"></i> Bad'
    };
    return icons[rating] || '';
  }

  // Affichage des résultats original amélioré
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
                 loading="lazy"
                 aria-describedby="product-image-${alt.id}">
          </td>
          <td>${escapeHtml(alt.name)}</td>
          <td>${alt.marque ? escapeHtml(alt.marque) : 'Aucune catégorie disponible'}</td>
          <td>
            <span class="rating ${alt.ban}" role="img" aria-label="Statut santé: ${alt.ban}">
              ${getRatingIcon('green')}
            </span>
          </td>
        `;
        resultsTable.appendChild(row);
      });
    });

    resultsContainer.style.display = hasResults ? 'block' : 'none';
    resultsContainer.setAttribute('aria-live', 'polite');

    // Gestion des marques (fonctionnalité originale)
    const uniqueBrands = [...new Set(products.flatMap(p => 
      p.alternatives?.map(alt => alt.marque).filter(Boolean)
    )];
    
    const brandsContainer = document.getElementById('brandsContainer');
    if (brandsContainer) {
      brandsContainer.innerHTML = uniqueBrands.length > 0 
        ? uniqueBrands.map(b => `<li class="brand-item">${escapeHtml(b)}</li>`).join('')
        : '<li>Aucune marque alternative trouvée</li>';
    }
  }

  // Formulaire de contribution original avec accessibilité
  contributionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    contributionForm.setAttribute('aria-live', 'polite');

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

  // Reste des fonctions utilitaires originales
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function isValidUrl(string) {
    try { new URL(string); return true; }
    catch (_) { return false; }
  }

  // ... (Toutes les autres fonctions originales conservées)

  // Ajouts pour l'accessibilité uniquement
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
        if (items[currentAutocompleteIndex]) items[currentAutocompleteIndex].click();
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
});
