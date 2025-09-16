import { borrowBook } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // This would normally fetch data from a server
    // For demo, we'll use localStorage or default data
    
    // Removed search form logic as it was commented out and likely redundant
    
    // Handle borrow button clicks
    document.querySelectorAll('.borrow-button').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const bookId = this.getAttribute('data-book-id');
            
            if (!bookId) {
                console.error('Book ID not found for borrowing.');
                alert('Could not borrow book: Book ID missing.');
                return;
            }

            try {
                const response = await borrowBook(bookId);
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
                    window.location.href = '/borrowed-books/';
                }
            } catch (error) {
                console.error('Failed to borrow book:', error);
                alert('Failed to borrow book');
            }
        });
    });
});