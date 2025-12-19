// frontend/js/index.js
// Handles apartment listing on home page (DB-driven)

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.apartments-grid');

  if (!container) {
    console.warn('Apartments container not found');
    return;
  }

  container.innerHTML = '<p>Loading apartments...</p>';

  try {
    // Fetch apartments from backend
    const result = await window.apiService.getApartments();

    if (!result.success) {
      container.innerHTML = '<p>Failed to load apartments</p>';
      return;
    }

    const apartments = result.data;

    if (!apartments || apartments.length === 0) {
      container.innerHTML = '<p>No apartments available</p>';
      return;
    }

    container.innerHTML = apartments.map(apartment => {
      const image = apartment.mainImage
        ? `http://localhost:5000${apartment.mainImage}`
        : '';

      return `
        <div class="apartment-card">
          <img src="${image}" alt="${apartment.title}">
          <h3>${apartment.title}</h3>
          <p>${apartment.location}</p>
          <p><strong>PKR ${apartment.price}/night</strong></p>
          <a href="apartment.html?id=${apartment._id}" class="btn">
            View Details
          </a>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading apartments:', error);
    container.innerHTML = '<p>Something went wrong</p>';
  }
});
