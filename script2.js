document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://mon-api-three.vercel.app';
  const searchInput = document.getElementById('search');
  const resultsTable = document.querySelector('#results tbody');
  const resultsContainer = document.getElementById('results-container');
  const alertDiv = document.getElementById('alert');
  const contributionForm = document.getElementById('contribution-form');
  const autocompleteBox = document.getElementById('autocomplete-results');
  const searchIcon = document.getElementById('search-icon');
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/50';
  
  // Cache simple pour stocker les résultats de recherche
  const searchCache = new Map();
  
  // Configuration des délais
  const DEBOUNCE_DELAY = 300;
  const ALERT_DISPLAY_TIME = 5000;
  const MIN_SEARCH_LENGTH = 2;
  const MAX_AUTOCOMPLETE_ITEMS = 5;

  // Éléments du formulaire
  const formElements = {
    productName: document.getElementById('product-name'),
    altName: document.getElementById('alt-name'),
    altDesc: document.getElementById('alt-desc'),
    rating: contributionForm.querySelector('input[name="rating"]:checked'),
    altImage: document.getElementById('alt-image'),
    submitBtn: contributionForm.querySelector('button')
  };

  // Positionnement de l'autocomplete
  function positionAutocompleteBox() {
    const inputRect = searchInput.getBoundingClientRect();
    autocompleteBox.style.top = `${inputRect.bottom}px`;
    autocompleteBox.style.left = `${inputRect.left}px`;
    autocompleteBox.style.width = `${inputRect.width}px`;
  }

  // Recherche de produits avec debounce
  const performSearch = debounce(async (term) => {
    if (term.length < MIN_SEARCH_LENGTH) {
      hideAutocomplete();
      return;
    }

    // Vérifier le cache d'abord
    if (searchCache.has(term)) {
      const cachedData = searchCache.get(term);
      displayAutocomplete(cachedData);
      displayResults(cachedData);
      return;
    }

    try {
      setLoadingState(true);
      
      const response = await fetch(`${API_URL}/api/products/search/${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.error) {
        showAlert(data.error, 'warning');
        return;
      }

      // Mettre en cache les résultats
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

  // Gestion de l'état de chargement
  function setLoadingState(isLoading) {
    if (isLoading) {
      searchIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    } else {
      searchIcon.innerHTML = '<i class="fas fa-search"></i>';
    }
  }

  // Debounce function optimisée
  function debounce(func, wait, immediate = false) {
    let timeout;
    return function(...args) {
      const context = this;
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  // Affichage des suggestions d'autocomplétion avec images
  function displayAutocomplete(products) {
    const suggestions = new Map(); // Utilisation d'une Map pour associer noms et images

    products.forEach(product => {
      if (product.name) {
        suggestions.set(product.name, product.photo_url || PLACEHOLDER_IMAGE);
      }
      product.alternatives?.forEach(alt => {
        if (alt.name) {
          suggestions.set(alt.name, alt.image || PLACEHOLDER_IMAGE);
        }
      });
    });

    if (suggestions.size === 0) {
      hideAutocomplete();
      return;
    }

    autocompleteBox.innerHTML = '';
    positionAutocompleteBox();

    Array.from(suggestions.entries())
      .slice(0, MAX_AUTOCOMPLETE_ITEMS)
      .forEach(([name, imageUrl]) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `
          <img src="${imageUrl}" alt="${name}" 
               onerror="this.src='${PLACEHOLDER_IMAGE}'" 
               class="autocomplete-img">
          <span>${escapeHtml(name)}</span>
        `;
        item.tabIndex = 0;
        item.addEventListener('click', () => selectAutocompleteItem(name));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') selectAutocompleteItem(name);
        });
        autocompleteBox.appendChild(item);
      });

    autocompleteBox.style.display = 'block';
  }

  function selectAutocompleteItem(name) {
    searchInput.value = name;
    hideAutocomplete();
    searchInput.focus();
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function hideAutocomplete() {
    autocompleteBox.style.display = 'none';
  }

  // Affichage des résultats dans le tableau
  function displayResults(products) {
    resultsTable.innerHTML = '';
    let hasResults = false;

    products.forEach(product => {
      product.alternatives?.forEach(alt => {
        hasResults = true;
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><img src="${alt.image || PLACEHOLDER_IMAGE}" alt="${alt.name}" 
               onerror="this.src='${PLACEHOLDER_IMAGE}'" loading="lazy"></td>
          <td>${escapeHtml(alt.name)}</td>
          <td>${alt.description ? escapeHtml(alt.description) : 'Aucune description disponible'}</td>
          <td><span class="rating ${alt.rating}">
            ${getRatingIcon(alt.rating)}
          </span></td>
        `;
        resultsTable.appendChild(row);
      });
    });

    if (hasResults) {
      resultsContainer.style.display = 'block';
    } else {
      showAlert('Aucun résultat trouvé', 'info');
    }
  }

  // Protection XSS basique
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Obtenir l'icône de notation
  function getRatingIcon(rating) {
    const icons = {
      green: '<i class="fas fa-thumbs-up"></i> Bonne',
      orange: '<i class="fas fa-circle"></i> Moyenne',
      red: '<i class="fas fa-thumbs-down"></i> Mauvaise'
    };
    return icons[rating] || '';
  }

  // Gestion du formulaire de contribution
  contributionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      productName: formElements.productName.value.trim(),
      altName: formElements.altName.value.trim(),
      altDesc: formElements.altDesc.value.trim(),
      rating: contributionForm.querySelector('input[name="rating"]:checked')?.value,
      altImage: formElements.altImage.value.trim()
    };

    // Validation améliorée
    if (!validateForm(formData)) return;

    try {
      setFormLoadingState(true);

      const response = await fetch(`${API_URL}/api/contribute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await parseResponse(response);

      showAlert(result.message || 'Merci pour votre contribution !', 'success');
      contributionForm.reset();
      searchCache.clear(); // Invalider le cache après une nouvelle contribution
    } catch (error) {
      console.error('Submission error:', error);
      showAlert(error.message || 'Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
    } finally {
      setFormLoadingState(false);
    }
  });

  function validateForm(formData) {
    if (!formData.productName) {
      showAlert('Veuillez saisir un produit original', 'warning');
      formElements.productName.focus();
      return false;
    }

    if (!formData.altName) {
      showAlert('Veuillez saisir un nom pour l\'alternative', 'warning');
      formElements.altName.focus();
      return false;
    }

    if (!formData.rating) {
      showAlert('Veuillez sélectionner une note santé', 'warning');
      return false;
    }

    if (formData.altImage && !isValidUrl(formData.altImage)) {
      showAlert('L\'URL de l\'image n\'est pas valide', 'warning');
      formElements.altImage.focus();
      return false;
    }

    return true;
  }

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function parseResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP! statut: ${response.status}`);
    }
    return response.json();
  }

  function setFormLoadingState(isLoading) {
    formElements.submitBtn.disabled = isLoading;
    formElements.submitBtn.innerHTML = isLoading 
      ? '<i class="fas fa-spinner fa-spin"></i> Envoi...' 
      : '<i class="fas fa-paper-plane"></i> Soumettre';
  }

  // Affichage des messages d'alerte
  function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.display = 'block';
    alertDiv.style.opacity = '1';
    
    setTimeout(() => {
      alertDiv.style.opacity = '0';
      setTimeout(() => {
        alertDiv.style.display = 'none';
      }, 300);
    }, ALERT_DISPLAY_TIME);
  }

  // Événements
  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value.trim());
  });

  searchInput.addEventListener('focus', positionAutocompleteBox);

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteBox.contains(e.target)) {
      hideAutocomplete();
    }
  });

  searchIcon.addEventListener('click', () => {
    searchInput.focus();
  });

  window.addEventListener('resize', debounce(positionAutocompleteBox, 100));
  window.addEventListener('scroll', debounce(positionAutocompleteBox, 100));
});