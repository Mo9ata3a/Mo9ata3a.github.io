// Variables globales
let productsDB = [];
const searchInput = document.getElementById('search');
const alertDiv = document.getElementById('alert');
const resultsTable = document.getElementById('results');
const tbody = resultsTable.querySelector('tbody');
const autocompleteResults = document.getElementById('autocomplete-results');
const contributionForm = document.getElementById('contribution-form');

// Base de données initiale
const initialProducts = [
  {
    name: "Coca-Cola",
    alternatives: [
      {
        name: "Eau gazeuse avec citron",
        description: "Rafraîchissant sans sucre ajouté",
        rating: "green",
        image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200"
      },
      {
        name: "Thé glacé maison",
        description: "Peu sucré avec du miel local",
        rating: "green",
        image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200"
      }
    ]
  },
  {
    name: "Nutella",
    alternatives: [
      {
        name: "Purée d'amandes maison",
        description: "Sans huile de palme, riche en protéines",
        rating: "green",
        image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200"
      },
      {
        name: "Beurre de cacahuète naturel",
        description: "100% cacahuètes, sans additifs",
        rating: "orange",
        image: "https://images.unsplash.com/photo-1603048719537-93e55a0d0e6c?w=200"
      }
    ]
  }
];

// Charger les données
function loadData() {
  try {
    const savedData = localStorage.getItem('healthyAlternativesDB');
    productsDB = savedData ? JSON.parse(savedData) : initialProducts;
  } catch (error) {
    console.error("Erreur de chargement des données:", error);
    productsDB = initialProducts;
    showAlert("Erreur de chargement des données locales. Utilisation des données par défaut.", "error");
  }
}

// Sauvegarder les données
function saveData() {
  localStorage.setItem('healthyAlternativesDB', JSON.stringify(productsDB));
}

// Afficher l'icône de notation
function getRatingIcon(rating) {
  switch(rating) {
    case 'green':
      return '<i class="fas fa-thumbs-up rating-icon green" title="Bonne alternative"></i>';
    case 'orange':
      return '<i class="fas fa-circle rating-icon orange" title="Alternative moyenne"></i>';
    case 'red':
      return '<i class="fas fa-thumbs-down rating-icon red" title="Mauvaise alternative"></i>';
    default:
      return '<i class="fas fa-question rating-icon" title="Non évalué"></i>';
  }
}

// Recherche de produits
function searchProduct(searchTerm = '') {
  const term = searchTerm || searchInput.value.trim();
  tbody.innerHTML = '';
  alertDiv.style.display = 'none';
  resultsTable.style.display = 'none';
  
  if (term.length < 2) {
    if (term.length > 0) {
      showAlert('Veuillez entrer au moins 2 caractères', 'error');
    }
    return;
  }
  
  const foundProducts = productsDB.filter(product => 
    product.name.toLowerCase().includes(term.toLowerCase())
  );
  
  if (foundProducts.length === 0) {
    showAlert(`Aucune alternative trouvée pour "${term}"`, 'info');
    return;
  }
  
  foundProducts.forEach(product => {
    product.alternatives.forEach(alt => {
      const row = document.createElement('tr');
      
      // Cellule image
      const imgCell = document.createElement('td');
      const img = document.createElement('img');
      img.src = alt.image || 'https://via.placeholder.com/50';
      img.alt = alt.name;
      imgCell.appendChild(img);
      
      // Cellule nom
      const nameCell = document.createElement('td');
      nameCell.textContent = alt.name;
      nameCell.style.fontWeight = 'bold';
      nameCell.style.color = '#2c3e50';
      
      // Cellule description
      const descCell = document.createElement('td');
      descCell.textContent = alt.description;
      
      // Cellule note
      const ratingCell = document.createElement('td');
      ratingCell.innerHTML = getRatingIcon(alt.rating);
      
      row.appendChild(imgCell);
      row.appendChild(nameCell);
      row.appendChild(descCell);
      row.appendChild(ratingCell);
      
      tbody.appendChild(row);
    });
  });
  
  resultsTable.style.display = 'table';
}

// Autocomplete
function showAutocompleteResults(results) {
  autocompleteResults.innerHTML = '';
  
  if (results.length === 0) {
    autocompleteResults.style.display = 'none';
    return;
  }
  
  results.forEach(product => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = product.name;
    item.addEventListener('click', () => {
      searchInput.value = product.name;
      searchProduct(product.name);
      autocompleteResults.style.display = 'none';
    });
    autocompleteResults.appendChild(item);
  });
  
  autocompleteResults.style.display = 'block';
}

// Gestion des alertes
function showAlert(message, type) {
  alertDiv.textContent = message;
  alertDiv.className = `alert-${type}`;
  alertDiv.style.display = 'block';
  
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 5000);
}

// Gestion du formulaire
function handleFormSubmission(e) {
  e.preventDefault();
  
  const productName = document.getElementById('product-name').value.trim();
  const altName = document.getElementById('alt-name').value.trim();
  const altDesc = document.getElementById('alt-desc').value.trim();
  const altRating = document.querySelector('input[name="rating"]:checked')?.value;
  const altImage = document.getElementById('alt-image').value.trim();
  
  if (!productName || !altName || !altDesc || !altRating) {
    showAlert('Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }
  
  // Trouver ou créer le produit
  let product = productsDB.find(p => p.name.toLowerCase() === productName.toLowerCase());
  
  if (!product) {
    product = { name: productName, alternatives: [] };
    productsDB.push(product);
  }
  
  // Ajouter l'alternative
  product.alternatives.push({
    name: altName,
    description: altDesc,
    rating: altRating,
    image: altImage || 'https://via.placeholder.com/50'
  });
  
  // Sauvegarder
  saveData();
  
  // Réinitialiser le formulaire
  contributionForm.reset();
  
  showAlert('Merci pour votre contribution ! Votre alternative a été ajoutée.', 'info');
  
  // Mettre à jour l'affichage si nécessaire
  if (searchInput.value.toLowerCase() === productName.toLowerCase()) {
    searchProduct(productName);
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  // Écouteurs d'événements
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim();
    
    if (term.length < 2) {
      autocompleteResults.style.display = 'none';
      return;
    }
    
    const results = productsDB.filter(product => 
      product.name.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);
    
    showAutocompleteResults(results);
  });
  
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput) {
      autocompleteResults.style.display = 'none';
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchProduct();
    }
  });
  
  if (contributionForm) {
    contributionForm.addEventListener('submit', handleFormSubmission);
  }
});