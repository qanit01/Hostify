// Frontend API Integration
// Connects HTML frontend to backend APIs

// Initialize API service (will be loaded from utils/apiService.js)
let apiService;
let loadingHandler;

// Wait for API service to load
document.addEventListener('DOMContentLoaded', () => {
  // Check if API service is available
  if (typeof window.apiService !== 'undefined') {
    apiService = window.apiService;
  } else {
    console.error('API Service not loaded. Make sure utils/apiService.js is included.');
  }

  if (typeof window.loadingHandler !== 'undefined') {
    loadingHandler = window.loadingHandler;
  } else {
    console.error('Loading Handler not loaded. Make sure utils/loadingHandler.js is included.');
  }

  // Initialize page-specific functionality
  initializePage();
});

// Initialize page based on current page
function initializePage() {
  const path = window.location.pathname;
  
  if (path.includes('index.html') || path === '/') {
    initializeHomePage();
  } else if (path.includes('apartment-detail.html')) {
    initializeApartmentDetailPage();
  } else if (path.includes('admin.html')) {
    initializeAdminPage();
  } else if (path.includes('login.html')) {
    initializeLoginPage();
  }
}

// Initialize Home Page
async function initializeHomePage() {
  await loadApartments();
}

// Load apartments from API
async function loadApartments() {
  const container = document.getElementById('apartments-grid');
  if (!container) return;

  if (loadingHandler) {
    loadingHandler.showLoading('apartments-grid', 'Loading apartments...');
  }

  try {
    const result = await apiService.getApartments();
    
    if (loadingHandler) {
      loadingHandler.hideLoading('apartments-grid');
    }

    if (result.success && result.data) {
      renderApartments(result.data, container);
    } else {
      if (loadingHandler) {
        loadingHandler.showError('apartments-grid', result.error || 'Failed to load apartments');
      }
      container.innerHTML = '<p class="error-message">Failed to load apartments. Please try again later.</p>';
    }
  } catch (error) {
    if (loadingHandler) {
      loadingHandler.hideLoading('apartments-grid');
      loadingHandler.showError('apartments-grid', 'Network error. Please check your connection.');
    }
    container.innerHTML = '<p class="error-message">Network error. Please check your connection.</p>';
  }
}

// Render apartments to DOM
function renderApartments(apartments, container) {
  if (!apartments || apartments.length === 0) {
    container.innerHTML = '<p>No apartments available at the moment.</p>';
    return;
  }

  container.innerHTML = apartments.map(apartment => {
    const mainImage = apartment.mainImage 
      ? (apartment.mainImage.startsWith('http') ? apartment.mainImage : `http://localhost:5000${apartment.mainImage}`)
      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

    return `
      <div class="apartment-card" onclick="window.location.href='apartment-detail.html?id=${apartment._id}'">
        <div class="apartment-image">
          <img src="${mainImage}" alt="${apartment.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
        </div>
        <div class="apartment-content">
          <h3 class="apartment-title">${apartment.title}</h3>
          <p class="apartment-description">${apartment.description || ''}</p>
          <div class="apartment-features">
            ${(apartment.features || []).map(feature => `<span class="feature">${feature}</span>`).join('')}
          </div>
          <div class="view-details">
            <span>Click to view details →</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Initialize Apartment Detail Page
async function initializeApartmentDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get('id');
  
  if (!apartmentId) {
    window.location.href = 'index.html';
    return;
  }

  await loadApartmentDetail(apartmentId);
}

// Load apartment detail from API
async function loadApartmentDetail(id) {
  if (loadingHandler) {
    loadingHandler.showLoading('apartment-detail-container', 'Loading apartment details...');
  }

  try {
    const result = await apiService.getApartment(id);
    
    if (loadingHandler) {
      loadingHandler.hideLoading('apartment-detail-container');
    }

    if (result.success && result.data) {
      renderApartmentDetail(result.data);
      window.currentApartment = result.data; // Store for lightbox
    } else {
      if (loadingHandler) {
        loadingHandler.showError('apartment-detail-container', result.error || 'Apartment not found');
      }
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    }
  } catch (error) {
    if (loadingHandler) {
      loadingHandler.hideLoading('apartment-detail-container');
      loadingHandler.showError('apartment-detail-container', 'Failed to load apartment details');
    }
  }
}

// Render apartment detail
function renderApartmentDetail(apartment) {
  // Update title
  const titleEl = document.getElementById('apartment-title');
  if (titleEl) titleEl.textContent = apartment.title;

  // Update location
  const locationEl = document.getElementById('apartment-location');
  if (locationEl) locationEl.textContent = apartment.location;

  // Update description
  const descEl = document.getElementById('apartment-description');
  if (descEl) descEl.textContent = apartment.description || '';

  // Update price
  const priceEl = document.getElementById('apartment-price');
  if (priceEl) priceEl.textContent = `PKR ${apartment.price.toLocaleString()}`;

  // Update gallery
  const mainImageEl = document.querySelector('.main-image');
  if (mainImageEl && apartment.mainImage) {
    const imageUrl = apartment.mainImage.startsWith('http') 
      ? apartment.mainImage 
      : `http://localhost:5000${apartment.mainImage}`;
    mainImageEl.innerHTML = `<img src="${imageUrl}" alt="${apartment.title}">`;
  }

  // Update thumbnails
  const thumbnailsEl = document.getElementById('gallery-thumbnails');
  if (thumbnailsEl && apartment.images && apartment.images.length > 0) {
    thumbnailsEl.innerHTML = apartment.images.map((image, index) => {
      const imageUrl = image.startsWith('http') ? image : `http://localhost:5000${image}`;
      return `
        <div class="thumbnail" onclick="openLightbox(${index})">
          <img src="${imageUrl}" alt="Gallery image ${index + 1}">
        </div>
      `;
    }).join('');
  }

  // Update amenities
  const amenitiesEl = document.getElementById('amenities-grid');
  if (amenitiesEl && apartment.amenities) {
    amenitiesEl.innerHTML = apartment.amenities.map(amenity => `
      <div class="amenity-item">
        <span class="amenity-icon">✓</span>
        <span>${amenity}</span>
      </div>
    `).join('');
  }

  // Update breadcrumb
  const breadcrumbEl = document.getElementById('apartment-breadcrumb');
  if (breadcrumbEl) breadcrumbEl.textContent = apartment.title;
}

// Initialize Admin Page
async function initializeAdminPage() {
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Verify token
  const result = await apiService.getCurrentUser();
  if (!result.success || result.data.user.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  await loadAdminApartments();
}

// Load apartments for admin
async function loadAdminApartments() {
  const container = document.getElementById('apartments-list');
  if (!container) return;

  if (loadingHandler) {
    loadingHandler.showLoading('apartments-list', 'Loading apartments...');
  }

  try {
    const result = await apiService.getApartments();
    
    if (loadingHandler) {
      loadingHandler.hideLoading('apartments-list');
    }

    if (result.success && result.data) {
      renderAdminApartments(result.data, container);
    } else {
      if (loadingHandler) {
        loadingHandler.showError('apartments-list', result.error || 'Failed to load apartments');
      }
    }
  } catch (error) {
    if (loadingHandler) {
      loadingHandler.hideLoading('apartments-list');
      loadingHandler.showError('apartments-list', 'Network error');
    }
  }
}

// Render apartments for admin
function renderAdminApartments(apartments, container) {
  if (!apartments || apartments.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No apartments yet</h3><p>Start by adding your first apartment</p></div>';
    return;
  }

  container.innerHTML = apartments.map(apartment => {
    const mainImage = apartment.mainImage 
      ? (apartment.mainImage.startsWith('http') ? apartment.mainImage : `http://localhost:5000${apartment.mainImage}`)
      : '';

    return `
      <div class="apartment-admin-card">
        <div class="apartment-admin-image">
          <img src="${mainImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}" alt="${apartment.title}">
        </div>
        <div class="apartment-admin-content">
          <h3 class="apartment-admin-title">${apartment.title}</h3>
          <div class="apartment-admin-location">📍 ${apartment.location}</div>
          <div class="apartment-admin-details">
            <div><i class="fas fa-bed"></i> ${apartment.bedrooms} Bedrooms</div>
            <div><i class="fas fa-bath"></i> ${apartment.bathrooms} Bathrooms</div>
            <div><i class="fas fa-users"></i> ${apartment.capacity} Guests</div>
            <div><i class="fas fa-images"></i> ${(apartment.images || []).length} Photos</div>
          </div>
          <div class="apartment-admin-price">PKR ${apartment.price.toLocaleString()}/night</div>
          <div class="apartment-admin-actions">
            <button class="btn btn-edit" onclick="editApartment('${apartment._id}')">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-delete" onclick="deleteApartment('${apartment._id}')">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Initialize Login Page
function initializeLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const container = document.getElementById('login-form');

  if (loadingHandler) {
    loadingHandler.showLoading('login-form', 'Signing in...');
  }

  try {
    const result = await apiService.login(email, password);
    
    if (loadingHandler) {
      loadingHandler.hideLoading('login-form');
    }

    if (result.success) {
      apiService.setToken(result.data.token);
      
      if (loadingHandler) {
        loadingHandler.showSuccess('login-form', 'Login successful! Redirecting...');
      }

      // Redirect based on role
      setTimeout(() => {
        if (result.data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 1000);
    } else {
      if (loadingHandler) {
        loadingHandler.showError('login-form', result.error || 'Login failed');
      }
    }
  } catch (error) {
    if (loadingHandler) {
      loadingHandler.hideLoading('login-form');
      loadingHandler.showError('login-form', 'Network error. Please try again.');
    }
  }
}

// Global functions for admin page
async function deleteApartment(id) {
  if (!confirm('Are you sure you want to delete this apartment?')) {
    return;
  }

  const cleanup = confirm('Do you want to delete associated images as well?');
  
  if (loadingHandler) {
    loadingHandler.showLoading('apartments-list', 'Deleting apartment...');
  }

  try {
    const result = await apiService.deleteApartment(id, cleanup);
    
    if (loadingHandler) {
      loadingHandler.hideLoading('apartments-list');
    }

    if (result.success) {
      if (loadingHandler) {
        loadingHandler.showSuccess('apartments-list', 'Apartment deleted successfully');
      }
      await loadAdminApartments();
    } else {
      if (loadingHandler) {
        loadingHandler.showError('apartments-list', result.error || 'Failed to delete apartment');
      }
    }
  } catch (error) {
    if (loadingHandler) {
      loadingHandler.hideLoading('apartments-list');
      loadingHandler.showError('apartments-list', 'Network error');
    }
  }
}

function editApartment(id) {
  // This would open the edit modal - implementation depends on admin.js
  if (typeof apartmentManager !== 'undefined') {
    apartmentManager.editApartment(id);
  }
}

// Export for use in other scripts
window.loadApartments = loadApartments;
window.loadApartmentDetail = loadApartmentDetail;
window.deleteApartment = deleteApartment;

