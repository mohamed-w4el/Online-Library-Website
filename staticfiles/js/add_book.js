import { addBook } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            try {
                const formData = new FormData(addBookForm);
                const response = await addBook(formData);
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
                    window.location.href = '/admin-dashboard/';
                }
            } catch (error) {
                console.error('Failed to add book:', error);
                alert('Failed to add book');
            }
        });
    }

    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '/admin-dashboard/';
        });
    }
});