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
    
    try {
        const booksHtml = await api.getBooks();
        const parser = new DOMParser();
        const doc = parser.parseFromString(booksHtml, 'text/html');
        const books = Array.from(doc.querySelectorAll('.book-item')).map(book => ({
            id: book.dataset.id,
            title: book.querySelector('.book-title').textContent,
            author: book.querySelector('.book-author').textContent
        }));
        
        bookSelect.innerHTML = '<option value="">-- Select a Book --</option>';
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author}`;
            bookSelect.appendChild(option);
        });
        
        bookSelect.addEventListener('change', async function() {
            if (this.value) {
                try {
                    const bookHtml = await api.getBookById(this.value);
                    const bookDoc = parser.parseFromString(bookHtml, 'text/html');
                    const bookData = {
                        title: bookDoc.querySelector('.book-title').textContent,
                        author: bookDoc.querySelector('.book-author').textContent,
                        category: bookDoc.querySelector('.book-category').textContent,
                        description: bookDoc.querySelector('.book-description').textContent,
                        cover_image_url: bookDoc.querySelector('.book-image')?.src || ''
                    };
                    
                    nameInput.value = bookData.title;
                    authorInput.value = bookData.author;
                    categoryInput.value = bookData.category;
                    descInput.value = bookData.description;
                    imageInput.value = bookData.cover_image_url;
                } catch (error) {
                    console.error('Failed to fetch book details:', error);
                    alert('Failed to load book details');
                }
            }
        });
        
        document.getElementById('editBookForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const bookId = bookSelect.value;
            const formData = new FormData(this);
            
            try {
                const response = await api.updateBook(bookId, formData);
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
                console.error('Failed to update book:', error);
                alert('Failed to update book');
            }
        });

        if (backButton) {
            backButton.addEventListener('click', function() {
                window.location.href = '/admin-dashboard/';
            });
        }

    } catch (error) {
        console.error('Failed to load books:', error);
        bookSelect.innerHTML = '<option value="">Error loading books</option>';
    }
});