// Authentication System for Admin Panel
class AuthManager {
    constructor() {
        this.isAuthenticated = this.checkAuthStatus();
        this.setupEventListeners();
    }

    // Check if user is authenticated
    checkAuthStatus() {
        const token = localStorage.getItem('hostify-admin-token');
        const expiry = localStorage.getItem('hostify-admin-expiry');
        
        if (!token || !expiry) {
            return false;
        }
        
        // Check if token has expired
        if (Date.now() > parseInt(expiry)) {
            this.logout();
            return false;
        }
        
        return true;
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
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Default credentials (you can change these)
        const validCredentials = {
            username: 'admin',
            password: 'hostify2024'
        };

        if (username === validCredentials.username && password === validCredentials.password) {
            this.login(rememberMe);
        } else {
            this.showError('Invalid username or password');
        }
    }

    // Login user
    login(rememberMe = false) {
        const token = this.generateToken();
        const expiry = rememberMe ? 
            Date.now() + (30 * 24 * 60 * 60 * 1000) : // 30 days
            Date.now() + (24 * 60 * 60 * 1000); // 1 day

        localStorage.setItem('hostify-admin-token', token);
        localStorage.setItem('hostify-admin-expiry', expiry.toString());
        localStorage.setItem('hostify-admin-remember', rememberMe.toString());

        this.isAuthenticated = true;
        
        // Redirect to admin panel
        window.location.href = 'admin.html';
    }

    // Logout user
    logout() {
        localStorage.removeItem('hostify-admin-token');
        localStorage.removeItem('hostify-admin-expiry');
        localStorage.removeItem('hostify-admin-remember');
        this.isAuthenticated = false;
        
        // Redirect to login page
        window.location.href = 'login.html';
    }

    // Generate a simple token (in production, use proper JWT or similar)
    generateToken() {
        return 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    protectAdminRoutes() {
        // Check if we're on an admin page
        if (window.location.pathname.includes('admin.html')) {
            if (!this.isAuthenticated) {
                window.location.href = 'login.html';
                return;
            }
        }
    }

    // Check if user is logged in (for other pages)
    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Password visibility toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'fas fa-eye';
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Add logout functionality to admin panel
function addLogoutButton() {
    const nav = document.querySelector('.nav');
    if (nav && window.location.pathname.includes('admin.html')) {
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            authManager.logout();
        };
        nav.appendChild(logoutBtn);
    }
}

// Add logout button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addLogoutButton();
});

// Export for use in other files
window.authManager = authManager;
