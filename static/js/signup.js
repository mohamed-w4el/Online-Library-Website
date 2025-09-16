import { register } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signUpForm');
    const message = document.getElementById('messageArea');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('Cpassword').value;
        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;

        // Validate required fields
        if (username === "" || email === "" || password === "" || confirmPassword === "" || firstName === "" || lastName === "") {
            message.textContent = "Please fill in all fields.";
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
            return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
            return;
        }

        // Validate password length
        if (password.length < 8) {
            message.textContent = "Password should be at least 8 characters long";
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
            return;
        }

        try {
            const formData = new FormData(signupForm);
            const response = await register(formData);
            
            // If we get here, registration was successful
            message.textContent = "Registration successful! Redirecting to login...";
            message.style.color = "#008000";
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = '/login/';
            }, 2000);
            
        } catch (error) {
            message.textContent = 'Registration failed. Please try again.';
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
            console.error('Registration error:', error);
        }
    });
});