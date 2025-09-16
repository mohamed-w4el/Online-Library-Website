import { login } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('messageArea');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const formData = new FormData(loginForm);
            const response = await login(formData);
            const parser = new DOMParser();
            const doc = parser.parseFromString(response, 'text/html');
            
            // Check for error messages
            const errorMessage = doc.querySelector('.error-message');
            if (errorMessage) {
                message.textContent = errorMessage.textContent;
                message.style.color = "#ff0000";
                setTimeout(function() {
                    message.textContent = "";
                    message.style.color = "#000000";
                }, 5000);
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
            message.textContent = 'Login failed. Please check your credentials.';
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
        }
    });
});

// This checkUser function seems to be using localStorage directly, which might conflict with the fetch-based auth in the other listener.
// It might be remnants of a different auth approach. Let's comment it out for now.
/*
function checkUser (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = getUser(username);
    
    if (user && user.password === password) {
        console.log("Login successful");
    
        localStorage.setItem("current", JSON.stringify(user));
        message.textContent = "Login successful";
        message.style.color = "rgb(40, 202, 0)";
        setTimeout ( function (){message.textContent = ""; message.style.color = "000000";}, 2999);
        setTimeout ( function () { 
            if (user.role === "admin") {window.location = "admindash.html";}
            else {window.location = "user_dashboard.html";}}, 3000)

    } else {
        console.log("Invalid credentials");
        message.textContent = "Invalid credentials";
        message.style.color = "rgb(255, 0, 0)";
        setTimeout ( function (){message.textContent = ""; message.style.color = "000000";}, 5000);
        return;
    }
}
*/