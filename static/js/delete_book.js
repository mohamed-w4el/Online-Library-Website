import { getBooks, getBookById, deleteBook } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    const bookSelect = document.getElementById('bookSelect');
    const form = document.getElementById('deleteBookForm');
    const cancelButton = document.getElementById('cancelButton');
    const bookDetails = document.getElementById('bookDetails');
    
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
                        // Show book details
                        bookDetails.style.display = 'block';
                        bookDetails.innerHTML = `
                            <div class="book-info">
                                <h3>Book Details</h3>
                                <p><strong>Title:</strong> ${data.title}</p>
                                <p><strong>Author:</strong> ${data.author}</p>
                                <p><strong>ISBN:</strong> ${data.isbn}</p>
                                <p><strong>Category:</strong> ${data.category}</p>
                                <p><strong>Description:</strong> ${data.description}</p>
                                <p><strong>Status:</strong> ${data.is_available ? 'Available' : 'Borrowed'}</p>
                                ${data.cover_image ? `<img src="${data.cover_image}" alt="Book Cover" class="book-cover">` : ''}
                            </div>
                        `;
                    } else {
                        showError(data.error || 'Failed to load book data');
                        bookDetails.style.display = 'none';
                    }
        } catch (error) {
                    console.error('Error:', error);
                    showError('Failed to load book data');
                    bookDetails.style.display = 'none';
                }
            } else {
                bookDetails.style.display = 'none';
            }
        });

        // Handle form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
                return;
            }

            try {
                const bookId = bookSelect.value;
                if (!bookId) {
                    showError('Please select a book to delete');
                    return;
                }

                const response = await fetch('/delete-book/', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ id: bookId }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccess(data.message);
                    // Remove the deleted book from the dropdown
                    bookSelect.remove(bookSelect.selectedIndex);
                    // Reset the form and hide details
                    form.reset();
                    bookDetails.style.display = 'none';
                } else {
                    showError(data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                showError('An error occurred while deleting the book.');
            }
        });

        // Handle back button
        cancelButton.addEventListener('click', function() {
            window.history.back();
        });

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
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    form.insertBefore(successMessage, form.firstChild);
}

function showError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    form.insertBefore(errorMessage, form.firstChild);
}