// Admin Panel JavaScript - Fully DB-driven & API-safe

class ApartmentManager {
  constructor() {
    this.apartments = [];
    this.categories = [];
    this.currentEditingId = null;
    this.currentDeletingId = null;
    this.init();
  }

  async init() {
    await this.loadCategories();
    await this.loadApartments();
    this.updateStats();
    this.setupEventListeners();
  }

  // ================= CATEGORIES =================
  async loadCategories() {
    const result = await apiService.get('/api/categories');
    if (result.success) {
      this.categories = result.data;
      this.renderCategories();
      this.populateCategoryDropdown();
    }
  }

  renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;

    if (!this.categories.length) {
      container.innerHTML = '<p>No categories found</p>';
      return;
    }

    container.innerHTML = this.categories.map(c => `
      <div class="category-card">
        <h4>${c.name}</h4>
        <p>${c.description || ''}</p>
      </div>
    `).join('');
  }

  async handleCategorySubmit() {
    const name = document.querySelector('#category-form [name="name"]').value.trim();
    const description = document.querySelector('#category-form [name="description"]').value.trim();

    if (!name) {
      loadingHandler.showError('category-form', 'Category name required');
      return;
    }

    const result = await apiService.post('/api/categories', { name, description });

    if (result.success) {
      loadingHandler.showSuccess('category-form', 'Category created');
      this.closeCategoryModal();
      await this.loadCategories();
    } else {
      loadingHandler.showError('category-form', result.error);
    }
  }

  populateCategoryDropdown() {
    const select = document.getElementById('apartment-category');
    if (!select) return;

    select.innerHTML =
      `<option value="">Select Category</option>` +
      this.categories.map(c =>
        `<option value="${c._id}">${c.name}</option>`
      ).join('');
  }

  // ================= APARTMENTS =================
  async loadApartments() {
    const result = await apiService.get('/api/apartments?all=true');
    if (result.success) {
      this.apartments = result.data;
      this.renderApartments();
    }
  }

  renderApartments() {
    const container = document.getElementById('apartments-list');
    if (!container) return;

    if (!this.apartments.length) {
      container.innerHTML = '<p>No apartments found</p>';
      return;
    }

    container.innerHTML = this.apartments.map(a => `
      <div class="apartment-admin-card">
        <h3>${a.title}</h3>
        <p>${a.location}</p>
        <p>PKR ${a.price}/night</p>
        <button onclick="apartmentManager.editApartment('${a._id}')">Edit</button>
        <button onclick="apartmentManager.deleteApartment('${a._id}')">Delete</button>
      </div>
    `).join('');
  }

  openAddApartmentModal() {
    this.currentEditingId = null;
    document.getElementById('apartment-form').reset();
    document.getElementById('apartment-modal').style.display = 'block';
  }

  editApartment(id) {
    const apt = this.apartments.find(a => a._id === id);
    if (!apt) return;

    this.currentEditingId = id;

    document.getElementById('apartment-title').value = apt.title;
    document.getElementById('apartment-location').value = apt.location;
    document.getElementById('apartment-price').value = apt.price;
    document.getElementById('apartment-capacity').value = apt.capacity;
    document.getElementById('apartment-description').value = apt.description;
    document.getElementById('apartment-category').value = apt.category?._id || '';

    document.getElementById('apartment-modal').style.display = 'block';
  }

  async handleFormSubmit() {
    const form = document.getElementById('apartment-form');
    const formData = new FormData(form);

    let endpoint = '/api/apartments';
    let method = 'POST';

    if (this.currentEditingId) {
      endpoint = `/api/apartments/${this.currentEditingId}`;
      method = 'PUT';
    }

    const result = await apiService.request(endpoint, {
      method,
      body: formData
    });

    if (result.success) {
      loadingHandler.showSuccess('apartment-modal', 'Saved successfully');
      this.closeModal();
      await this.loadApartments();
      this.updateStats();
    } else {
      loadingHandler.showError('apartment-modal', result.error);
    }
  }

  async deleteApartment(id) {
    if (!confirm('Delete apartment?')) return;

    const result = await apiService.delete(`/api/apartments/${id}`);

    if (result.success) {
      await this.loadApartments();
      this.updateStats();
    }
  }

  updateStats() {
    document.getElementById('total-apartments').textContent = this.apartments.length;
  }

  closeModal() {
    document.getElementById('apartment-modal').style.display = 'none';
    this.currentEditingId = null;
  }

  closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
  }

  setupEventListeners() {
    document.getElementById('apartment-form')
      ?.addEventListener('submit', e => {
        e.preventDefault();
        this.handleFormSubmit();
      });

    document.getElementById('category-form')
      ?.addEventListener('submit', e => {
        e.preventDefault();
        this.handleCategorySubmit();
      });
  }
}

// ================= GLOBAL =================
let apartmentManager;
document.addEventListener('DOMContentLoaded', () => {
  apartmentManager = new ApartmentManager();
  window.apartmentManager = apartmentManager;
});
