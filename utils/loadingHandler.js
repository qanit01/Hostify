// Loading and Error Handling Utilities for Frontend

class LoadingHandler {
  constructor() {
    this.loadingElements = new Map();
  }

  // Show loading state
  showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
      const loadingHTML = `
        <div class="loading-overlay" id="${elementId}-loading">
          <div class="loading-spinner"></div>
          <p class="loading-message">${message}</p>
        </div>
      `;
      element.style.position = 'relative';
      element.insertAdjacentHTML('beforeend', loadingHTML);
      this.loadingElements.set(elementId, true);
    }
  }

  // Hide loading state
  hideLoading(elementId) {
    const loadingElement = document.getElementById(`${elementId}-loading`);
    if (loadingElement) {
      loadingElement.remove();
      this.loadingElements.delete(elementId);
    }
  }

  // Show error message
  showError(elementId, message, duration = 5000) {
    const element = document.getElementById(elementId);
    if (element) {
      // Remove existing error
      const existingError = element.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }

      const errorHTML = `
        <div class="error-message" style="display: block;">
          <i class="fas fa-exclamation-circle"></i>
          <span>${message}</span>
        </div>
      `;
      element.insertAdjacentHTML('afterbegin', errorHTML);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          const errorElement = element.querySelector('.error-message');
          if (errorElement) {
            errorElement.remove();
          }
        }, duration);
      }
    }
  }

  // Show success message
  showSuccess(elementId, message, duration = 3000) {
    const element = document.getElementById(elementId);
    if (element) {
      // Remove existing success
      const existingSuccess = element.querySelector('.success-message');
      if (existingSuccess) {
        existingSuccess.remove();
      }

      const successHTML = `
        <div class="success-message" style="display: block;">
          <i class="fas fa-check-circle"></i>
          <span>${message}</span>
        </div>
      `;
      element.insertAdjacentHTML('afterbegin', successHTML);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          const successElement = element.querySelector('.success-message');
          if (successElement) {
            successElement.remove();
          }
        }, duration);
      }
    }
  }

  // Handle API response with loading and error handling
  async handleRequest(elementId, apiCall, successMessage, onSuccess) {
    this.showLoading(elementId);
    
    try {
      const result = await apiCall();
      
      this.hideLoading(elementId);
      
      if (result.success) {
        if (successMessage) {
          this.showSuccess(elementId, successMessage);
        }
        if (onSuccess) {
          onSuccess(result.data);
        }
        return result;
      } else {
        this.showError(elementId, result.error || 'An error occurred');
        return result;
      }
    } catch (error) {
      this.hideLoading(elementId);
      this.showError(elementId, error.message || 'An unexpected error occurred');
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const loadingHandler = new LoadingHandler();
window.loadingHandler = loadingHandler; // Make available globally

module.exports = loadingHandler;

