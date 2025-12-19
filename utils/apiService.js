// frontend/utils/apiService.js
// Centralized API service for frontend (DB-driven, production-safe)

const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // ================= AUTH TOKEN =================
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  // ================= CORE REQUEST =================
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: options.method || 'GET',
      headers: { ...(options.headers || {}) },
      body: options.body
    };

    // Add JSON header ONLY when body is plain JSON
    if (config.body && !(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Attach JWT token if present
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error'
      };
    }
  }

  // ================= HTTP METHODS =================
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData
    });
  }

  // ================= AUTH =================
  register(userData) {
    return this.post('/api/auth/register', userData);
  }

  async login(email, password) {
    const result = await this.post('/api/auth/login', { email, password });

    if (result.success && result.data.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  getCurrentUser() {
    return this.get('/api/auth/me');
  }

  logout() {
    this.setToken(null);
    return { success: true };
  }

  // ================= APARTMENTS =================
  getApartments(all = false) {
    return this.get(`/api/apartments${all ? '?all=true' : ''}`);
  }

  getApartment(id) {
    return this.get(`/api/apartments/${id}`);
  }

  createApartment(apartmentData, files = {}) {
    const formData = new FormData();

    Object.keys(apartmentData).forEach(key => {
      if (apartmentData[key] !== undefined) {
        formData.append(key, apartmentData[key]);
      }
    });

    if (files.mainImage) {
      formData.append('mainImage', files.mainImage);
    }

    if (Array.isArray(files.images)) {
      files.images.forEach(img => formData.append('images', img));
    }

    return this.postFormData('/api/apartments', formData);
  }

  deleteApartment(id, cleanup = false) {
    return this.delete(
      `/api/apartments/${id}${cleanup ? '?cleanup=true' : ''}`
    );
  }

  // ================= BOOKINGS =================
  getBookings() {
    return this.get('/api/bookings');
  }

  createBooking(bookingData) {
    return this.post('/api/bookings', bookingData);
  }
}

// Global singleton (important for plain JS frontend)
window.apiService = new ApiService();
