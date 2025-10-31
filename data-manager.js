// Data Manager for integrating admin data with main website
class DataManager {
    constructor() {
        this.apartments = this.loadApartments();
    }

    // Load apartments from localStorage
    loadApartments() {
        const saved = localStorage.getItem('hostify-apartments');
        if (saved) {
            return JSON.parse(saved);
        }
        // Return default apartments if none exist
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

    // Get all apartments
    getAllApartments() {
        return this.apartments;
    }

    // Get apartment by ID
    getApartmentById(id) {
        return this.apartments.find(apartment => apartment.id === parseInt(id));
    }

    // Get apartment by title (for URL routing)
    getApartmentByTitle(title) {
        return this.apartments.find(apartment => 
            apartment.title.toLowerCase().replace(/\s+/g, '-') === title.toLowerCase()
        );
    }

    // Update apartments from admin panel
    updateApartments() {
        this.apartments = this.loadApartments();
    }
}

// Initialize data manager
const dataManager = new DataManager();

// Function to dynamically render apartments on main page
function renderDynamicApartments() {
    const apartmentsContainer = document.querySelector('.apartments-grid');
    if (!apartmentsContainer) return;

    const apartments = dataManager.getAllApartments();
    
    apartmentsContainer.innerHTML = apartments.map(apartment => `
        <div class="apartment-card" onclick="window.location.href='apartment-detail.html?id=${apartment.id}'">
            <div class="apartment-image">
                <img src="${apartment.mainImage}" alt="${apartment.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="apartment-content">
                <h3 class="apartment-title">${apartment.title}</h3>
                <p class="apartment-description">${apartment.description}</p>
                <div class="apartment-features">
                    ${apartment.features.map(feature => `<span class="feature">${feature}</span>`).join('')}
                </div>
                <div class="view-details">
                    <span>Click to view details →</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to render apartment detail page
function renderApartmentDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const apartmentId = urlParams.get('id');
    
    if (!apartmentId) {
        window.location.href = 'index.html';
        return;
    }

    const apartment = dataManager.getApartmentById(apartmentId);
    if (!apartment) {
        window.location.href = 'index.html';
        return;
    }

    // Update page title
    document.title = `${apartment.title} - Hostify by Abdullah`;

    // Update apartment header
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `<a href="index.html">Home</a> > <span>${apartment.title}</span>`;
    }

    const mainTitle = document.querySelector('.apartment-main-title');
    if (mainTitle) {
        mainTitle.textContent = apartment.title;
    }

    const location = document.querySelector('.apartment-location span');
    if (location) {
        location.textContent = apartment.location;
    }

    // Update gallery
    const mainImage = document.querySelector('.main-image');
    if (mainImage) {
        mainImage.innerHTML = `<img src="${apartment.mainImage}" alt="${apartment.title}">`;
    }

    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = apartment.images.map((image, index) => `
            <div class="thumbnail" onclick="openLightbox(${index})">
                <img src="${image}" alt="Gallery image ${index + 1}">
            </div>
        `).join('');
    }

    // Update apartment details
    const description = document.querySelector('.content-section p');
    if (description) {
        description.textContent = apartment.description;
    }

    // Update amenities
    const amenitiesGrid = document.querySelector('.amenities-grid');
    if (amenitiesGrid) {
        amenitiesGrid.innerHTML = apartment.amenities.map(amenity => `
            <div class="amenity-item">
                <span class="amenity-icon">✓</span>
                <span>${amenity}</span>
            </div>
        `).join('');
    }

    // Update booking section
    const price = document.querySelector('.price');
    if (price) {
        price.textContent = `PKR ${apartment.price.toLocaleString()}`;
    }

    // Store apartment data for lightbox
    window.currentApartment = apartment;
}

// Initialize dynamic content when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the main page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        renderDynamicApartments();
    }
    
    // Check if we're on an apartment detail page
    if (window.location.pathname.includes('apartment-detail.html')) {
        renderApartmentDetail();
    }
});
