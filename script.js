document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://mon-rdepq3uwl-kamilis-projects-0f8aed8e.vercel.app';
  const searchInput = document.getElementById('search');
  const resultsTable = document.querySelector('#results tbody');
  const resultsContainer = document.getElementById('results');
  const alertDiv = document.getElementById('alert');
  const contributionForm = document.getElementById('contribution-form');
  const autocompleteBox = document.getElementById('autocomplete-results');

  // Positionner la boîte d'autocomplete
  function positionAutocompleteBox() {
    const inputRect = searchInput.getBoundingClientRect();
    autocompleteBox.style.top = `${inputRect.bottom + window.scrollY}px`;
    autocompleteBox.style.left = `${inputRect.left + window.scrollX}px`;
    autocompleteBox.style.width = `${inputRect.width}px`;
  }

  // Recherche de produits
  searchInput.addEventListener('input', async (e) => {
    const term = e.target.value.trim();
    autocompleteBox.style.display = 'none';
    resultsTable.innerHTML = '';
    resultsContainer.style.display = 'none';

    if (term.length < 2) return;

    try {
      const response = await fetch(`${API_URL}/api/products/search/${term}`);
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
    }
  });

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

    suggestions.forEach(name => {
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
          <td>${alt.description || 'No description available'}</td>
          <td><span class="rating ${alt.rating}">
            ${alt.rating === 'green' ? '👍' : alt.rating === 'orange' ? '🟠' : '👎'}
          </span></td>
        `;

        resultsTable.appendChild(row);
      });
    });

    if (hasResults) {
      resultsContainer.style.display = 'table';
    } else {
      showAlert('Aucun résultat trouvé', 'info');
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

    // Validation de base
    if (!formData.productName || !formData.altName || !formData.rating) {
      showAlert('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      showAlert(result.message || 'Soumission réussie !', 'success');
      contributionForm.reset();
    } catch (error) {
      console.error('Submission error:', error);
      showAlert('Erreur lors de l\'envoi', 'error');
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
    }, 2700);
  }

  // Cacher l'autocomplete quand on clique ailleurs
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput && !autocompleteBox.contains(e.target)) {
      autocompleteBox.style.display = 'none';
    }
  });

  // Recalculer la position de l'autocomplete en cas de scroll
  window.addEventListener('scroll', () => {
    if (autocompleteBox.style.display === 'block') {
      positionAutocompleteBox();
    }
  });
});