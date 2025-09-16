// Import all functions from api.js
import * as api from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    const bookSelect = document.getElementById('bookSelect');
    const nameInput = document.getElementById('editBookName');
    const authorInput = document.getElementById('editAuthor');
    const categoryInput = document.getElementById('editCategory');
    const descInput = document.getElementById('editDescription');
    const imageInput = document.getElementById('editImage');
    const backButton = document.getElementById('backButton');
    const form = document.getElementById('editBookForm');
    const cancelButton = document.getElementById('cancelButton');
    
    try {
        // Fetch all books
        const response = await fetch('/books/json/', {
            credentials: 'include'
        });
        const books = await response.json();

        if (response.ok) {
            // Populate book select dropdown
            books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author}`;
            bookSelect.appendChild(option);
        });
        } else {
            showError('Failed to load books');
        }
        
        // Handle book selection
        bookSelect.addEventListener('change', async function() {
            if (this.value) {
                try {
                    // Load book data
                    const response = await fetch(`/book-details/${this.value}/`, {
                        credentials: 'include'
                    });
                    const data = await response.json();

                    if (response.ok) {
                        // Fill form with book data
                        document.getElementById('bookId').value = data.id;
                        document.getElementById('title').value = data.title;
                        document.getElementById('author').value = data.author;
                        document.getElementById('isbn').value = data.isbn;
                        document.getElementById('category').value = data.category;
                        document.getElementById('description').value = data.description;
                        document.getElementById('is_available').value = data.is_available;

                        // Show current image if exists
                        if (data.cover_image) {
                            const currentImage = document.getElementById('currentImage');
                            currentImage.style.display = 'block';
                            currentImage.querySelector('img').src = data.cover_image;
                        } else {
                            const currentImage = document.getElementById('currentImage');
                            currentImage.style.display = 'none';
                        }
                    } else {
                        showError(data.error || 'Failed to load book data');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showError('Failed to load book data');
                }
            }
        });
        
        // Handle form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = {
                    id: document.getElementById('bookId').value,
                    title: document.getElementById('title').value,
                    author: document.getElementById('author').value,
                    isbn: document.getElementById('isbn').value,
                    category: document.getElementById('category').value,
                    description: document.getElementById('description').value
            };
            
                const response = await fetch(window.location.href, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(formData),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccess(data.message);
                } else {
                    showError(data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                showError('An error occurred while updating the book.');
            }
        });

        // Handle back button
        cancelButton.addEventListener('click', function() {
            window.history.back();
        });

        if (backButton) {
            backButton.addEventListener('click', function() {
                    window.location.href = adminDashboardUrl;
            });
        }

    } catch (error) {
        console.error('Failed to load books:', error);
        showError('Failed to load books');
    }
});

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showSuccess(message) {
    alert(message);
    window.history.back();
}

function showError(message) {
    alert(message);
}