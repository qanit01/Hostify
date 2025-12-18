// Admin Panel JavaScript - Updated to use Backend API
class ApartmentManager {
    constructor() {
        this.currentEditingId = null;
        this.currentDeletingId = null;
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadApartments();
        this.updateStats();
        this.setupEventListeners();
    }

    // Load categories from API
    async loadCategories() {
        try {
            if (window.apiService) {
                const result = await window.apiService.getCategories();
                if (result.success) {
                    this.categories = result.data;
                }
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    // Load apartments from API
    async loadApartments() {
        const container = document.getElementById('apartments-list');
        if (!container) return;

        if (window.loadingHandler) {
            window.loadingHandler.showLoading('apartments-list', 'Loading apartments...');
        }

        try {
            if (!window.apiService) {
                throw new Error('API Service not loaded');
            }

            const result = await window.apiService.getApartments();

            if (window.loadingHandler) {
                window.loadingHandler.hideLoading('apartments-list');
            }

            if (result.success && result.data) {
                this.apartments = result.data;
                this.renderApartments();
            } else {
                if (window.loadingHandler) {
                    window.loadingHandler.showError('apartments-list', result.error || 'Failed to load apartments');
                }
                container.innerHTML = '<div class="empty-state"><h3>Failed to load apartments</h3></div>';
            }
        } catch (error) {
            if (window.loadingHandler) {
                window.loadingHandler.hideLoading('apartments-list');
                window.loadingHandler.showError('apartments-list', 'Network error');
            }
            console.error('Error loading apartments:', error);
        }
    }

    // Update dashboard statistics
    updateStats() {
        const totalApartments = this.apartments ? this.apartments.length : 0;
        const totalRooms = this.apartments 
            ? this.apartments.reduce((sum, apt) => sum + (apt.bedrooms || 0), 0)
            : 0;
        
        const apartmentsEl = document.getElementById('total-apartments');
        const roomsEl = document.getElementById('total-rooms');
        
        if (apartmentsEl) apartmentsEl.textContent = totalApartments;
        if (roomsEl) roomsEl.textContent = totalRooms;
    }

    // Render apartments list
    renderApartments() {
        const container = document.getElementById('apartments-list');
        if (!container) return;
        
        if (!this.apartments || this.apartments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <h3>No Apartments Yet</h3>
                    <p>Start by adding your first apartment listing</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.apartments.map(apartment => {
            const mainImage = apartment.mainImage 
                ? (apartment.mainImage.startsWith('http') 
                    ? apartment.mainImage 
                    : `http://localhost:5000${apartment.mainImage}`)
                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

            return `
                <div class="apartment-admin-card">
                    <div class="apartment-admin-image">
                        <img src="${mainImage}" alt="${apartment.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                    </div>
                    <div class="apartment-admin-content">
                        <h3 class="apartment-admin-title">${apartment.title}</h3>
                        <div class="apartment-admin-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${apartment.location}
                        </div>
                        <div class="apartment-admin-details">
                            <div><i class="fas fa-bed"></i> ${apartment.bedrooms} Bedrooms</div>
                            <div><i class="fas fa-bath"></i> ${apartment.bathrooms} Bathrooms</div>
                            <div><i class="fas fa-users"></i> ${apartment.capacity} Guests</div>
                            <div><i class="fas fa-images"></i> ${(apartment.images || []).length} Photos</div>
                        </div>
                        <div class="apartment-admin-price">PKR ${apartment.price.toLocaleString()}/night</div>
                        <div class="apartment-admin-actions">
                            <button class="btn btn-edit" onclick="apartmentManager.editApartment('${apartment._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-delete" onclick="apartmentManager.deleteApartment('${apartment._id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Open add apartment modal
    openAddApartmentModal() {
        this.currentEditingId = null;
        document.getElementById('modal-title').textContent = 'Add New Apartment';
        document.getElementById('submit-btn').textContent = 'Add Apartment';
        document.getElementById('apartment-form').reset();
        
        // Populate category dropdown
        this.populateCategoryDropdown();
        
        document.getElementById('apartment-modal').style.display = 'block';
    }

    // Populate category dropdown
    populateCategoryDropdown() {
        const categorySelect = document.getElementById('apartment-category');
        if (categorySelect && this.categories) {
            categorySelect.innerHTML = '<option value="">Select Category</option>' +
                this.categories.map(cat => 
                    `<option value="${cat._id}">${cat.name}</option>`
                ).join('');
        }
    }

    // Edit apartment
    editApartment(id) {
        const apartment = this.apartments.find(apt => apt._id === id);
        if (!apartment) {
            if (window.loadingHandler) {
                window.loadingHandler.showError('apartments-list', 'Apartment not found');
            }
            return;
        }

        this.currentEditingId = id;
        document.getElementById('modal-title').textContent = 'Edit Apartment';
        document.getElementById('submit-btn').textContent = 'Update Apartment';
        
        // Populate category dropdown
        this.populateCategoryDropdown();
        
        // Fill form with apartment data
        document.getElementById('apartment-title').value = apartment.title || '';
        document.getElementById('apartment-location').value = apartment.location || '';
        document.getElementById('apartment-price').value = apartment.price || '';
        document.getElementById('apartment-bedrooms').value = apartment.bedrooms || '';
        document.getElementById('apartment-bathrooms').value = apartment.bathrooms || '';
        document.getElementById('apartment-capacity').value = apartment.capacity || '';
        document.getElementById('apartment-description').value = apartment.description || '';
        document.getElementById('apartment-amenities').value = (apartment.amenities || []).join(', ');
        document.getElementById('apartment-features').value = (apartment.features || []).join(', ');
        document.getElementById('apartment-category').value = apartment.category?._id || apartment.category || '';
        document.getElementById('apartment-is-available').checked = apartment.isAvailable !== false;

        document.getElementById('apartment-modal').style.display = 'block';
    }

    // Delete apartment
    async deleteApartment(id) {
        const apartment = this.apartments.find(apt => apt._id === id);
        if (!apartment) return;

        if (!confirm(`Are you sure you want to delete "${apartment.title}"?`)) {
            return;
        }

        const cleanup = confirm('Do you want to delete associated images as well?');
        this.currentDeletingId = id;
        
        // Show apartment preview in delete modal
        document.getElementById('delete-preview').innerHTML = `
            <h4>${apartment.title}</h4>
            <p>${apartment.location}</p>
            <p>PKR ${apartment.price.toLocaleString()}/night</p>
        `;
        
        document.getElementById('delete-modal').style.display = 'block';
    }

    // Confirm delete
    async confirmDelete() {
        if (!this.currentDeletingId) return;

        const cleanup = confirm('Delete associated images?');
        
        if (window.loadingHandler) {
            window.loadingHandler.showLoading('apartments-list', 'Deleting apartment...');
        }

        try {
            if (!window.apiService) {
                throw new Error('API Service not loaded');
            }

            const result = await window.apiService.deleteApartment(this.currentDeletingId, cleanup);

            if (window.loadingHandler) {
                window.loadingHandler.hideLoading('apartments-list');
            }

            if (result.success) {
                if (window.loadingHandler) {
                    window.loadingHandler.showSuccess('apartments-list', 'Apartment deleted successfully');
                }
                this.closeDeleteModal();
                await this.loadApartments();
                this.updateStats();
            } else {
                if (window.loadingHandler) {
                    window.loadingHandler.showError('apartments-list', result.error || 'Failed to delete apartment');
                }
            }
        } catch (error) {
            if (window.loadingHandler) {
                window.loadingHandler.hideLoading('apartments-list');
                window.loadingHandler.showError('apartments-list', 'Network error');
            }
            console.error('Error deleting apartment:', error);
        }
    }

    // Close modals
    closeModal() {
        document.getElementById('apartment-modal').style.display = 'none';
        this.currentEditingId = null;
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').style.display = 'none';
        this.currentDeletingId = null;
    }

    // Setup event listeners
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('apartment-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const apartmentModal = document.getElementById('apartment-modal');
            const deleteModal = document.getElementById('delete-modal');
            
            if (e.target === apartmentModal) {
                this.closeModal();
            }
            if (e.target === deleteModal) {
                this.closeDeleteModal();
            }
        });
    }

    // Handle form submission
    async handleFormSubmit() {
        const form = document.getElementById('apartment-form');
        const formData = new FormData(form);
        
        const apartmentData = {
            title: formData.get('title'),
            location: formData.get('location'),
            price: parseInt(formData.get('price')),
            bedrooms: parseInt(formData.get('bedrooms')),
            bathrooms: parseInt(formData.get('bathrooms')),
            capacity: parseInt(formData.get('capacity')),
            description: formData.get('description'),
            category: formData.get('category'),
            amenities: formData.get('amenities').split(',').map(item => item.trim()).filter(item => item),
            features: formData.get('features').split(',').map(item => item.trim()).filter(item => item),
            isAvailable: formData.get('is-available') === 'on'
        };

        // Get files
        const mainImageFile = formData.get('mainImage');
        const imageFiles = formData.getAll('images');

        // Validation
        if (!apartmentData.title || !apartmentData.location || !apartmentData.price || 
            !apartmentData.bedrooms || !apartmentData.bathrooms || !apartmentData.capacity || 
            !apartmentData.description || !apartmentData.category) {
            if (window.loadingHandler) {
                window.loadingHandler.showError('apartment-modal', 'Please fill in all required fields');
            } else {
                alert('Please fill in all required fields');
            }
            return;
        }

        if (window.loadingHandler) {
            window.loadingHandler.showLoading('apartment-modal', this.currentEditingId ? 'Updating apartment...' : 'Creating apartment...');
        }

        try {
            if (!window.apiService) {
                throw new Error('API Service not loaded');
            }

            let result;
            const files = {
                mainImage: mainImageFile && mainImageFile.size > 0 ? mainImageFile : null,
                images: imageFiles.filter(f => f.size > 0)
            };

            if (this.currentEditingId) {
                // Update existing apartment
                result = await window.apiService.updateApartment(this.currentEditingId, apartmentData);
            } else {
                // Create new apartment
                result = await window.apiService.createApartment(apartmentData, files);
            }

            if (window.loadingHandler) {
                window.loadingHandler.hideLoading('apartment-modal');
            }

            if (result.success) {
                if (window.loadingHandler) {
                    window.loadingHandler.showSuccess('apartment-modal', 
                        this.currentEditingId ? 'Apartment updated successfully!' : 'Apartment created successfully!');
                }
                this.closeModal();
                await this.loadApartments();
                this.updateStats();
            } else {
                if (window.loadingHandler) {
                    window.loadingHandler.showError('apartment-modal', result.error || 'Operation failed');
                } else {
                    alert(result.error || 'Operation failed');
                }
            }
        } catch (error) {
            if (window.loadingHandler) {
                window.loadingHandler.hideLoading('apartment-modal');
                window.loadingHandler.showError('apartment-modal', 'Network error. Please try again.');
            } else {
                alert('Network error. Please try again.');
            }
            console.error('Error saving apartment:', error);
        }
    }
}

// Global functions for onclick handlers
function openAddApartmentModal() {
    if (window.apartmentManager) {
        window.apartmentManager.openAddApartmentModal();
    }
}

function closeModal() {
    if (window.apartmentManager) {
        window.apartmentManager.closeModal();
    }
}

function closeDeleteModal() {
    if (window.apartmentManager) {
        window.apartmentManager.closeDeleteModal();
    }
}

function confirmDelete() {
    if (window.apartmentManager) {
        window.apartmentManager.confirmDelete();
    }
}

// Initialize the apartment manager when the page loads
let apartmentManager;
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for API service to be available
    if (typeof window.apiService !== 'undefined') {
        apartmentManager = new ApartmentManager();
        window.apartmentManager = apartmentManager;
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof window.apiService !== 'undefined') {
                apartmentManager = new ApartmentManager();
                window.apartmentManager = apartmentManager;
            }
        }, 500);
    }
});
