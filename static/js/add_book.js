import { addBook } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            try {
                const formData = new FormData(addBookForm);
                const response = await addBook(formData);
                const data = JSON.parse(response);
                
                if (data.success) {
                    alert(data.message || 'Book added successfully!');
                    window.location.href = '/admin-dashboard/';
                } else {
                    alert(data.error || 'Failed to add book');
                }
            } catch (error) {
                console.error('Failed to add book:', error);
                alert('Failed to add book. Please try again.');
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