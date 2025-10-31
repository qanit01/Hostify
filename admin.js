// Admin Panel JavaScript
class ApartmentManager {
    constructor() {
        this.apartments = this.loadApartments();
        this.currentEditingId = null;
        this.currentDeletingId = null;
        this.init();
    }

    init() {
        this.renderApartments();
        this.updateStats();
        this.setupEventListeners();
    }

    // Load apartments from localStorage
    loadApartments() {
        const saved = localStorage.getItem('hostify-apartments');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default apartments if none exist
        return [
            {
                id: 1,
                title: "Cozy 2 BHK in E11 Islamabad",
                location: "Main Iran Avenue, E-11/2 Northern Strip, Islamabad",
                price: 15000,
                bedrooms: 2,
                bathrooms: 2,
                capacity: 4,
                description: "A warm and inviting 2-bedroom apartment perfect for families or small groups. Features modern amenities and a comfortable living space in the heart of E11.",
                amenities: ["WiFi", "AC", "Kitchen", "Parking", "Balcony"],
                features: ["2 Bedrooms", "2 Bathrooms", "Fully Furnished", "WiFi"],
                images: [
                    "assets/assetap1/01.jpg",
                    "assets/assetap1/02.jpg",
                    "assets/assetap1/03.jpg",
                    "assets/assetap1/04.jpg",
                    "assets/assetap1/05.jpg"
                ],
                mainImage: "assets/assetap1/main.jpg"
            },
            {
                id: 2,
                title: "2 BHK Escape in Islamabad",
                location: "E-11/3, Islamabad",
                price: 18000,
                bedrooms: 2,
                bathrooms: 2,
                capacity: 4,
                description: "Your perfect escape in Islamabad. This beautifully designed 2-bedroom apartment offers a peaceful retreat with all the comforts of home.",
                amenities: ["WiFi", "AC", "Kitchen", "Parking", "Balcony", "Gym"],
                features: ["2 Bedrooms", "2 Bathrooms", "Balcony", "Parking"],
                images: [
                    "assets/assetap2/01.jpg",
                    "assets/assetap2/02.jpg",
                    "assets/assetap2/03.jpg",
                    "assets/assetap2/04.jpg"
                ],
                mainImage: "assets/assetap2/main.jpg"
            },
            {
                id: 3,
                title: "2 BHK Apartment in Islamabad",
                location: "E-11/4, Islamabad",
                price: 16000,
                bedrooms: 2,
                bathrooms: 2,
                capacity: 4,
                description: "A spacious and well-appointed 2-bedroom apartment designed for comfort and convenience. Ideal for both short and long-term stays in Islamabad.",
                amenities: ["WiFi", "AC", "Kitchen", "Parking", "Laundry"],
                features: ["2 Bedrooms", "2 Bathrooms", "Kitchen", "AC"],
                images: [
                    "assets/assetap3/01.jpg",
                    "assets/assetap3/02.jpg",
                    "assets/assetap3/03.jpg",
                    "assets/assetap3/04.jpg",
                    "assets/assetap3/05.jpg"
                ],
                mainImage: "assets/assetap3/main.jpg"
            }
        ];
    }

    // Save apartments to localStorage
    saveApartments() {
        localStorage.setItem('hostify-apartments', JSON.stringify(this.apartments));
    }

    // Update dashboard statistics
    updateStats() {
        const totalApartments = this.apartments.length;
        const totalRooms = this.apartments.reduce((sum, apt) => sum + apt.bedrooms, 0);
        
        document.getElementById('total-apartments').textContent = totalApartments;
        document.getElementById('total-rooms').textContent = totalRooms;
    }

    // Render apartments list
    renderApartments() {
        const container = document.getElementById('apartments-list');
        
        if (this.apartments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <h3>No Apartments Yet</h3>
                    <p>Start by adding your first apartment listing</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.apartments.map(apartment => `
            <div class="apartment-admin-card">
                <div class="apartment-admin-image">
                    <img src="${apartment.mainImage}" alt="${apartment.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
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
                        <div><i class="fas fa-images"></i> ${apartment.images.length} Photos</div>
                    </div>
                    <div class="apartment-admin-price">PKR ${apartment.price.toLocaleString()}/night</div>
                    <div class="apartment-admin-actions">
                        <button class="btn btn-edit" onclick="apartmentManager.editApartment(${apartment.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="apartmentManager.deleteApartment(${apartment.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Open add apartment modal
    openAddApartmentModal() {
        this.currentEditingId = null;
        document.getElementById('modal-title').textContent = 'Add New Apartment';
        document.getElementById('submit-btn').textContent = 'Add Apartment';
        document.getElementById('apartment-form').reset();
        document.getElementById('apartment-modal').style.display = 'block';
    }

    // Edit apartment
    editApartment(id) {
        const apartment = this.apartments.find(apt => apt.id === id);
        if (!apartment) return;

        this.currentEditingId = id;
        document.getElementById('modal-title').textContent = 'Edit Apartment';
        document.getElementById('submit-btn').textContent = 'Update Apartment';
        
        // Fill form with apartment data
        document.getElementById('apartment-title').value = apartment.title;
        document.getElementById('apartment-location').value = apartment.location;
        document.getElementById('apartment-price').value = apartment.price;
        document.getElementById('apartment-bedrooms').value = apartment.bedrooms;
        document.getElementById('apartment-bathrooms').value = apartment.bathrooms;
        document.getElementById('apartment-capacity').value = apartment.capacity;
        document.getElementById('apartment-description').value = apartment.description;
        document.getElementById('apartment-amenities').value = apartment.amenities.join(', ');
        document.getElementById('apartment-features').value = apartment.features.join(', ');
        document.getElementById('apartment-images').value = apartment.images.join('\n');
        document.getElementById('apartment-main-image').value = apartment.mainImage;

        document.getElementById('apartment-modal').style.display = 'block';
    }

    // Delete apartment
    deleteApartment(id) {
        const apartment = this.apartments.find(apt => apt.id === id);
        if (!apartment) return;

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
    confirmDelete() {
        if (this.currentDeletingId) {
            this.apartments = this.apartments.filter(apt => apt.id !== this.currentDeletingId);
            this.saveApartments();
            this.renderApartments();
            this.updateStats();
            this.closeDeleteModal();
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
        document.getElementById('apartment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

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
    handleFormSubmit() {
        const formData = new FormData(document.getElementById('apartment-form'));
        
        const apartmentData = {
            title: formData.get('title'),
            location: formData.get('location'),
            price: parseInt(formData.get('price')),
            bedrooms: parseInt(formData.get('bedrooms')),
            bathrooms: parseInt(formData.get('bathrooms')),
            capacity: parseInt(formData.get('capacity')),
            description: formData.get('description'),
            amenities: formData.get('amenities').split(',').map(item => item.trim()).filter(item => item),
            features: formData.get('features').split(',').map(item => item.trim()).filter(item => item),
            images: formData.get('images').split('\n').map(item => item.trim()).filter(item => item),
            mainImage: formData.get('mainImage')
        };

        // Validation
        if (!apartmentData.title || !apartmentData.location || !apartmentData.price || 
            !apartmentData.bedrooms || !apartmentData.bathrooms || !apartmentData.capacity || 
            !apartmentData.description || !apartmentData.mainImage) {
            alert('Please fill in all required fields');
            return;
        }

        if (this.currentEditingId) {
            // Update existing apartment
            const index = this.apartments.findIndex(apt => apt.id === this.currentEditingId);
            if (index !== -1) {
                this.apartments[index] = { ...apartmentData, id: this.currentEditingId };
            }
        } else {
            // Add new apartment
            const newId = Math.max(...this.apartments.map(apt => apt.id), 0) + 1;
            this.apartments.push({ ...apartmentData, id: newId });
        }

        this.saveApartments();
        this.renderApartments();
        this.updateStats();
        this.closeModal();
    }
}

// Global functions for onclick handlers
function openAddApartmentModal() {
    apartmentManager.openAddApartmentModal();
}

function closeModal() {
    apartmentManager.closeModal();
}

function closeDeleteModal() {
    apartmentManager.closeDeleteModal();
}

function confirmDelete() {
    apartmentManager.confirmDelete();
}

// Initialize the apartment manager when the page loads
let apartmentManager;
document.addEventListener('DOMContentLoaded', () => {
    apartmentManager = new ApartmentManager();
});
