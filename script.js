document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://mon-api-three.vercel.app';
  const searchInput = document.getElementById('search');
  const resultsTable = document.querySelector('#results tbody');
  const resultsContainer = document.getElementById('results-container');
  const alertDiv = document.getElementById('alert');
  const contributionForm = document.getElementById('contribution-form');
  const autocompleteBox = document.getElementById('autocomplete-results');
  const searchIcon = document.getElementById('search-icon');

  // Remplacez la fonction positionAutocompleteBox par :
function positionAutocompleteBox() {
  const inputRect = searchInput.getBoundingClientRect();
  autocompleteBox.style.top = `${inputRect.height}px`; // Juste en dessous de l'input
  autocompleteBox.style.left = '0';
  autocompleteBox.style.width = '100%';
}
searchInput.addEventListener('focus', positionAutocompleteBox);
  // Recherche de produits
  searchInput.addEventListener('input', debounce(async (e) => {
    const term = e.target.value.trim();
    autocompleteBox.style.display = 'none';
    resultsTable.innerHTML = '';
    resultsContainer.style.display = 'none';

    if (term.length < 2) return;

    try {
      searchIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      const response = await fetch(`${API_URL}/api/products/search/${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.error) {
        showAlert(data.error, 'warning');
        return;
      }

      displayAutocomplete(data);
      displayResults(data);

    } catch (error) {
      console.error('Search error:', error);
      showAlert('Erreur de connexion à l\'API', 'error');
    } finally {
      searchIcon.innerHTML = '<i class="fas fa-search"></i>';
    }
  }, 300));

  // Debounce function pour limiter les requêtes
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Affichage des suggestions d'autocomplétion
  function displayAutocomplete(products) {
    const suggestions = new Set();

    products.forEach(product => {
      if (product.name) suggestions.add(product.name);
      product.alternatives?.forEach(alt => {
        if (alt.name) suggestions.add(alt.name);
      });
    });

    if (suggestions.size === 0) return;

    autocompleteBox.innerHTML = '';
    positionAutocompleteBox();

    Array.from(suggestions).slice(0, 5).forEach(name => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = name;
      item.addEventListener('click', () => {
        searchInput.value = name;
        autocompleteBox.style.display = 'none';
        searchInput.focus();
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
      autocompleteBox.appendChild(item);
    });

    autocompleteBox.style.display = 'block';
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
          <td><img src="${alt.image || 'https://via.placeholder.com/50'}" alt="${alt.name}" onerror="this.src='https://via.placeholder.com/50'"></td>
          <td>${alt.name}</td>
          <td>${alt.description || 'Aucune description disponible'}</td>
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

  // Obtenir l'icône de notation
  function getRatingIcon(rating) {
    switch(rating) {
      case 'green': return '<i class="fas fa-thumbs-up"></i> Bonne';
      case 'orange': return '<i class="fas fa-circle"></i> Moyenne';
      case 'red': return '<i class="fas fa-thumbs-down"></i> Mauvaise';
      default: return '';
    }
  }

  // Gestion du formulaire de contribution
  contributionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      productName: document.getElementById('product-name').value.trim(),
      altName: document.getElementById('alt-name').value.trim(),
      altDesc: document.getElementById('alt-desc').value.trim(),
      rating: document.querySelector('input[name="rating"]:checked')?.value,
      altImage: document.getElementById('alt-image').value.trim()
    };

    // Validation
    if (!formData.productName || !formData.altName || !formData.rating) {
      showAlert('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    try {
      const submitBtn = contributionForm.querySelector('button');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';

      const response = await fetch(`${API_URL}/api/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      showAlert(result.message || 'Merci pour votre contribution !', 'success');
      contributionForm.reset();
    } catch (error) {
      console.error('Submission error:', error);
      showAlert('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
    } finally {
      const submitBtn = contributionForm.querySelector('button');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Soumettre';
    }
  });

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
    }, 5000);
  }

  // Gestion des clics en dehors de l'autocomplete
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput && !autocompleteBox.contains(e.target) && e.target !== searchIcon) {
      autocompleteBox.style.display = 'none';
    }
  });

  // Focus sur la recherche quand on clique sur l'icône
  searchIcon.addEventListener('click', () => {
    searchInput.focus();
  });

  // Recalculer la position de l'autocomplete
  window.addEventListener('resize', positionAutocompleteBox);
  window.addEventListener('scroll', positionAutocompleteBox);
});
