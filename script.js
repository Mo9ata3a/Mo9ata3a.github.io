document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://mon-lqvichepk-kamilis-projects-0f8aed8e.vercel.app'; // Remplace par ton URL Vercel
  const searchInput = document.getElementById('search');
  const resultsTable = document.querySelector('#results tbody');
  const alertDiv = document.getElementById('alert');
  const contributionForm = document.getElementById('contribution-form');

  // Recherche de produits
  searchInput.addEventListener('input', async (e) => {
    const term = e.target.value.trim();
    if (term.length < 2) return;

    try {
      const response = await fetch(`${API_URL}/api/products/search/${term}`);
      const data = await response.json();
      
      if (data.error) {
        showAlert(data.error, 'warning');
        return;
      }

      displayResults(data);
    } catch (error) {
      showAlert('Erreur de connexion à l\'API', 'error');
    }
  });

  // Affichage des résultats
  function displayResults(products) {
    resultsTable.innerHTML = '';
    
    products.forEach(product => {
      product.alternatives.forEach(alt => {
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
  }

  // Gestion du formulaire
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
      showAlert(result.message, 'success');
      contributionForm.reset();
    } catch (error) {
      showAlert('Erreur lors de l\'envoi', 'error');
    }
  });

  // Affichage des messages
  function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.className = `alert ${type}`;
    setTimeout(() => alertDiv.className = 'alert', 3000);
  }
});