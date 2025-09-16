import { login, register, logout } from './api.js';

// Add authentication check to protected pages
document.addEventListener('DOMContentLoaded', async function() {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(loginForm);

            try {
                const response = await login(formData);
                const parser = new DOMParser();
                const doc = parser.parseFromString(response, 'text/html');
                
                // Check for error messages
                const errorMessage = doc.querySelector('.error-message');
                if (errorMessage) {
                    alert(errorMessage.textContent);
                    return;
                }
                
                // Check for success redirect
                const redirectUrl = doc.querySelector('meta[name="redirect-url"]')?.content;
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    // Default redirects based on user type
                    const isSuperuser = doc.querySelector('meta[name="is-superuser"]')?.content === 'true';
                    window.location.href = isSuperuser ? '/admin-dashboard/' : '/user-dashboard/';
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please check your credentials.');
            }
        });
    }

    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(registerForm);

            try {
                const response = await register(formData);
                const parser = new DOMParser();
                const doc = parser.parseFromString(response, 'text/html');
                
                // Check for error messages
                const errorMessage = doc.querySelector('.error-message');
                if (errorMessage) {
                    alert(errorMessage.textContent);
                    return;
                }
                
                // Check for success message
                const successMessage = doc.querySelector('.success-message');
                if (successMessage) {
                    alert(successMessage.textContent);
                    window.location.href = '/login/';
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }

    // Handle logout
    const logoutButton = document.getElementById('logout-link');
    if (logoutButton) {
        logoutButton.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                await logout();
                window.location.href = '/';
            } catch (error) {
                console.error('Logout failed:', error);
                alert('Logout failed. Please try again.');
            }
        });
    }
});

