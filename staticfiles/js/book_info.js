import { getBookById, borrowBook } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');
    
    if (bookId) {
        try {
            const bookHtml = await getBookById(bookId);
            const parser = new DOMParser();
            const doc = parser.parseFromString(bookHtml, 'text/html');
            
            const book = {
                title: doc.querySelector('.book-title').textContent,
                author: doc.querySelector('.book-author').textContent,
                category: doc.querySelector('.book-category').textContent,
                description: doc.querySelector('.book-description').textContent,
                cover_image_url: doc.querySelector('.book-image')?.src || '',
                is_available: doc.querySelector('.book-availability')?.textContent === 'Available'
            };
            
            document.title = book.title;
            document.getElementById('bookTitle').textContent = book.title;
            document.getElementById('bookImage').src = book.cover_image_url;
            document.getElementById('bookImage').alt = book.title;
            
            const isAvailable = book.is_available;
            
            const bookMeta = document.getElementById('bookMeta');
            bookMeta.innerHTML = `
                <h1>${book.title}</h1>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Category:</strong> ${book.category}</p>
                <p><strong>Description:</strong> ${book.description}</p>
                <p class="${isAvailable ? 'available' : 'unavailable'}">${isAvailable ? 'Available' : 'Unavailable'}</p>
                <div class="auth-buttons">
                    <a href="#" class="borrow-button ${!isAvailable ? 'disabled' : ''}" 
                       data-book-id="${bookId}" 
                       ${!isAvailable ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
                       ${isAvailable ? 'Borrow Book' : 'Not Available'}
                    </a>
                </div>
            `;
            
            if (isAvailable) {
                document.querySelector('.borrow-button').addEventListener('click', async function(e) {
                    e.preventDefault();
                    try {
                        await borrowBook(bookId);
                        alert('Book borrowed successfully!');
                        window.location.href = '/borrowed-books/';
                    } catch (error) {
                        console.error('Failed to borrow book:', error);
                        alert('Failed to borrow book');
                    }
                });
            }

        } catch (error) {
            console.error('Failed to fetch book details:', error);
            const bookDetailsContainer = document.getElementById('bookDetailsContainer');
            if (bookDetailsContainer) {
                bookDetailsContainer.innerHTML = '<p>Error loading book details.</p>';
            }
            document.title = 'Error';
        }
    } else {
        console.error('Book ID not provided in URL.');
        const bookDetailsContainer = document.getElementById('bookDetailsContainer');
        if (bookDetailsContainer) {
            bookDetailsContainer.innerHTML = '<p>Error: Book ID missing from URL.</p>';
        }
        document.title = 'Error';
    }
});

// Removed the old borrowBook function as it used localStorage