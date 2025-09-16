import { getBooks, getBookById, deleteBook } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    await loadBooks();
    
    document.getElementById('bookSelect').addEventListener('change', async function() {
        const bookId = this.value;
        if (bookId) {
            await showBookDetails(bookId);
        } else {
            document.getElementById('bookDetails').style.display = 'none';
            document.getElementById('deleteButton').disabled = true;
        }
    });
    
    document.getElementById('deleteBookForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const bookId = document.getElementById('bookSelect').value;
        try {
            const response = await deleteBook(bookId);
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
            console.error('Failed to delete book:', error);
            alert('Failed to delete book');
        }
    });

    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '/admin-dashboard/';
        });
    }
});

async function loadBooks() {
    try {
        const booksHtml = await getBooks();
        const parser = new DOMParser();
        const doc = parser.parseFromString(booksHtml, 'text/html');
        const books = Array.from(doc.querySelectorAll('.book-item')).map(book => ({
            id: book.dataset.id,
            title: book.querySelector('.book-title').textContent,
            author: book.querySelector('.book-author').textContent
        }));
        
        const select = document.getElementById('bookSelect');
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author || 'Unknown'}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load books:', error);
        const select = document.getElementById('bookSelect');
        select.innerHTML = '<option value="">Error loading books</option>';
    }
}

async function showBookDetails(bookId) {
    try {
        const bookHtml = await getBookById(bookId);
        const parser = new DOMParser();
        const doc = parser.parseFromString(bookHtml, 'text/html');
        
        document.getElementById('displayBookName').textContent = doc.querySelector('.book-title').textContent;
        document.getElementById('displayAuthor').textContent = doc.querySelector('.book-author').textContent || 'Unknown';
        document.getElementById('displayCategory').textContent = doc.querySelector('.book-category').textContent || 'Not specified';
        document.getElementById('displayDescription').textContent = doc.querySelector('.book-description').textContent || 'No description available';
        document.getElementById('bookDetails').style.display = 'block';
        document.getElementById('deleteButton').disabled = false;
    } catch (error) {
        console.error('Failed to fetch book details:', error);
        document.getElementById('bookDetails').style.display = 'none';
        document.getElementById('deleteButton').disabled = true;
    }
}