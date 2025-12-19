// frontend/js/apartment.js
// Handles single apartment detail page

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const apartmentId = params.get('id');

  if (!apartmentId) {
    alert('Apartment ID missing');
    return;
  }

  try {
    const result = await window.apiService.getApartment(apartmentId);

    if (!result.success) {
      alert('Failed to load apartment');
      return;
    }

    const apartment = result.data;

    document.querySelector('.apartment-title').textContent = apartment.title;
    document.querySelector('.apartment-location').textContent = apartment.location;
    document.querySelector('.apartment-price').textContent =
      `PKR ${apartment.price} / night`;
    document.querySelector('.apartment-description').textContent =
      apartment.description || '';

    // Render images
    const gallery = document.querySelector('.apartment-images');
    if (gallery && apartment.images) {
      gallery.innerHTML = apartment.images.map(img =>
        `<img src="http://localhost:5000${img}" alt="">`
      ).join('');
    }
  } catch (error) {
    console.error('Error loading apartment:', error);
    alert('Something went wrong');
  }
});
