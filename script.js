document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://mon-rdepq3uwl-kamilis-projects-0f8aed8e.vercel.app';
  const searchInput = document.getElementById('search');
  const resultsTable = document.querySelector('#results tbody');
  const resultsContainer = document.getElementById('results');
  const alertDiv = document.getElementById('alert');
  const contributionForm = document.getElementById('contribution-form');
  const autocompleteBox = document.getElementById('autocomplete-results');

  // Recherche de produits
  searchInput.addEventListener('input', async (e) => {
    const term = e.target.value.trim();
    autocompleteBox.innerHTML = '';
    autocompleteBox.style.display = 'none';
    resultsTable.innerHTML = '';
    resultsContainer.style.display = 'none';

    if (term.length < 2) return;

    try {
      const response = await fetch(`${API_URL}/api/products/search/${term}`);
      const data = await response.json();

      if (data.error) {
        showAlert(data.error, 'warning');
        return;
      }

      displayAutocomplete(data);
      displayResults(data);

    } catch (error) {
      showAlert('Erreur de connexion à l\'API', 'error');
    }
  });

  // Affichage des suggestions d’autocomplétion
  function displayAutocomplete(products) {
    const suggestions = new Set();
item.addEventListener('click', () => {
  searchInput.value = name;
  autocompleteBox.innerHTML = '';
  autocompleteBox.style.display = 'none';
  searchInput.dispatchEvent(new Event('input'));
});

    products.forEach(product => {
      if (product.name) suggestions.add(product.name);
      product.alternatives?.forEach(alt => {
        if (alt.name) suggestions.add(alt.name);
      });
    });

    if (suggestions.size === 0) return;

    suggestions.forEach(name => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = name;
      item.addEventListener('click', () => {
        searchInput.value = name;
        autocompleteBox.innerHTML = '';
        autocompleteBox.style.display = 'none';
        searchInput.dispatchEvent(new Event('input'));
      });
      autocompleteBox.appendChild(item);
    });

    autocompleteBox.style.display = 'block';
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
          <td><img src="${alt.image || 'placeholder.jpg'}" alt="${alt.name}"></td>
          <td>${alt.name}</td>
          <td>${alt.description}</td>
          <td><span class="rating ${alt.rating}">
            ${alt.rating === 'green' ? '👍' : alt.rating === 'orange' ? '🟠' : '👎'}
          </span></td>
        `;

        resultsTable.appendChild(row);
      });
    });

    if (hasResults) {
      resultsContainer.style.display = 'table';
    }
  }

  // Gestion du formulaire de contribution
  contributionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      productName: document.getElementById('product-name').value,
      altName: document.getElementById('alt-name').value,
      altDesc: document.getElementById('alt-desc').value,
      rating: document.querySelector('input[name="rating"]:checked').value,
      altImage: document.getElementById('alt-image').value
    };

    try {
      const response = await fetch(`${API_URL}/api/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      showAlert(result.message || 'Soumission réussie !', 'success');
      contributionForm.reset();
    } catch (error) {
      showAlert('Erreur lors de l\'envoi', 'error');
    }
  });

  // Affichage des messages d'alerte
  function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.display = 'block';
    setTimeout(() => {
      alertDiv.className = 'alert';
      alertDiv.style.display = 'none';
    }, 3000);
  }
});
