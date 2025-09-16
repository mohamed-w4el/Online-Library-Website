import { borrowBook } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // This would normally fetch data from a server
    // For demo, we'll use localStorage or default data
    
    // Removed search form logic as it was commented out and likely redundant
    
    // Make book cards clickable to navigate to book info page
    document.querySelectorAll('.book').forEach(bookCard => {
        bookCard.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons or other interactive elements
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            const bookId = this.getAttribute('data-id');
            if (bookId) {
                window.location.href = `/book-info/?id=${bookId}`;
            }
        });
    });
    
    // Handle borrow button clicks
    document.querySelectorAll('.borrow-button').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering the card click
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