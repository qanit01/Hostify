// Updated Authentication System using JWT Backend API
// Replaces old localStorage-based auth

class AuthManager {
  constructor() {
    this.setupEventListeners();
  }

  // Setup event listeners
  setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Check authentication on page load
    this.protectAdminRoutes();
  }

  // Handle login form submission
  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const container = document.getElementById('login-form');

    if (!email || !password) {
      this.showError('Please enter email and password');
      return;
    }

    if (window.loadingHandler) {
      window.loadingHandler.showLoading('login-form', 'Signing in...');
    }

    try {
      if (!window.apiService) {
        throw new Error('API Service not loaded');
      }

      const result = await window.apiService.login(email, password);

      if (window.loadingHandler) {
        window.loadingHandler.hideLoading('login-form');
      }

      if (result.success) {
        // Store token
        window.apiService.setToken(result.data.token);
        
        if (window.loadingHandler) {
          window.loadingHandler.showSuccess('login-form', 'Login successful! Redirecting...');
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
        this.showError(result.error || 'Invalid email or password');
      }
    } catch (error) {
      if (window.loadingHandler) {
        window.loadingHandler.hideLoading('login-form');
        window.loadingHandler.showError('login-form', 'Network error. Please try again.');
      } else {
        this.showError('Network error. Please try again.');
      }
    }
  }

  // Logout user
  async logout() {
    if (window.apiService) {
      await window.apiService.logout();
    }
    
    // Clear any remaining tokens
    localStorage.removeItem('token');
    localStorage.removeItem('hostify-admin-token');
    localStorage.removeItem('hostify-admin-expiry');
    
    // Redirect to login page
    window.location.href = 'login.html';
  }

  // Check if user is authenticated
  async checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      if (window.apiService) {
        const result = await window.apiService.getCurrentUser();
        return result.success;
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  // Show error message
  showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorDiv && errorText) {
      errorText.textContent = message;
      errorDiv.style.display = 'flex';
      
      // Hide error after 5 seconds
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  // Protect admin routes
  async protectAdminRoutes() {
    // Check if we're on an admin page
    if (window.location.pathname.includes('admin.html')) {
      const isAuthenticated = await this.checkAuthStatus();
      
      if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
      }

      // Verify user is admin
      try {
        if (window.apiService) {
          const result = await window.apiService.getCurrentUser();
          if (!result.success || result.data.user.role !== 'admin') {
            window.location.href = 'login.html';
            return;
          }
        }
      } catch (error) {
        window.location.href = 'login.html';
        return;
      }
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    return await this.checkAuthStatus();
  }
}

// Password visibility toggle
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const passwordIcon = document.getElementById('password-icon');
  
  if (passwordInput && passwordIcon) {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      passwordIcon.className = 'fas fa-eye-slash';
    } else {
      passwordInput.type = 'password';
      passwordIcon.className = 'fas fa-eye';
    }
  }
}

// Initialize authentication manager when DOM is loaded
let authManager;
document.addEventListener('DOMContentLoaded', () => {
  // Wait for API service to load
  if (typeof window.apiService !== 'undefined') {
    authManager = new AuthManager();
    window.authManager = authManager;
  } else {
    // Retry after a short delay
    setTimeout(() => {
      if (typeof window.apiService !== 'undefined') {
        authManager = new AuthManager();
        window.authManager = authManager;
      }
    }, 500);
  }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}

