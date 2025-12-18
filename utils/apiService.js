// API Service Layer for Frontend
// Centralized API communication with loading and error handling

// Note: process.env doesn't work in browser, so we use hardcoded URL
// For production, you can change this or use a build tool
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token') || null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('token');
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add token if available
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network error occurred' 
      };
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // POST with FormData (for file uploads)
  async postFormData(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {}
    };

    // Add token if available
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, browser will set it with boundary
    try {
      const response = await fetch(url, {
        ...config,
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network error occurred' 
      };
    }
  }

  // Auth methods
  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  // Apartment methods
  async getApartments(all = false) {
    const endpoint = all ? '/apartments?all=true' : '/apartments';
    return this.get(endpoint);
  }

  async getApartment(id) {
    return this.get(`/apartments/${id}`);
  }

  async createApartment(apartmentData, files) {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(apartmentData).forEach(key => {
      if (key !== 'mainImage' && key !== 'images') {
        formData.append(key, apartmentData[key]);
      }
    });

    // Add files
    if (files.mainImage) {
      formData.append('mainImage', files.mainImage);
    }
    if (files.images && files.images.length > 0) {
      files.images.forEach(file => {
        formData.append('images', file);
      });
    }

    return this.postFormData('/apartments', formData);
  }

  async updateApartment(id, apartmentData) {
    return this.put(`/apartments/${id}`, apartmentData);
  }

  async deleteApartment(id, cleanup = false) {
    return this.delete(`/apartments/${id}${cleanup ? '?cleanup=true' : ''}`);
  }

  // Booking methods
  async getBookings() {
    return this.get('/bookings');
  }

  async getBooking(id) {
    return this.get(`/bookings/${id}`);
  }

  async createBooking(bookingData) {
    return this.post('/bookings', bookingData);
  }

  async updateBooking(id, bookingData) {
    return this.put(`/bookings/${id}`, bookingData);
  }

  async deleteBooking(id) {
    return this.delete(`/bookings/${id}`);
  }

  // Category methods
  async getCategories() {
    return this.get('/categories');
  }

  async getCategory(id) {
    return this.get(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.post('/categories', categoryData);
  }

  async updateCategory(id, categoryData) {
    return this.put(`/categories/${id}`, categoryData);
  }

  async deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  }

  // Search methods
  async searchApartments(filters) {
    const queryString = new URLSearchParams(filters).toString();
    return this.get(`/search?${queryString}`);
  }

  // Media methods
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.postFormData('/media/upload', formData);
  }

  async uploadMultipleImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return this.postFormData('/media/upload-multiple', formData);
  }
}

// Export singleton instance
const apiService = new ApiService();
window.apiService = apiService; // Make available globally

module.exports = apiService;

