// /js/search.js
import { searchBooks, borrowBook } from './api.js';

async function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    try {
        const searchResultsHtml = await searchBooks(query);
        const parser = new DOMParser();
        const doc = parser.parseFromString(searchResultsHtml, 'text/html');
        
        const results = Array.from(doc.querySelectorAll('.book-card')).map(card => ({
            id: card.dataset.id,
            title: card.querySelector('.book-title').textContent,
            author: card.querySelector('.book-author').textContent,
            isbn: card.querySelector('.book-isbn').textContent,
            description: card.querySelector('.book-description').textContent,
            cover_image_url: card.querySelector('.book-cover img')?.src || '',
            is_available: card.querySelector('.book-availability')?.textContent === 'Available'
        }));
        
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
        alert('Failed to search books');
    }
}

function displaySearchResults(results) {
    // Remove existing search results if any
    const existingResults = document.getElementById('searchResults');
    if (existingResults) {
        document.body.removeChild(existingResults);
    }

    // Create container for search results
    const searchResultsDiv = document.createElement('div');
    searchResultsDiv.id = 'searchResults';
    searchResultsDiv.className = 'search-results';

    // Create header with close button
    const header = document.createElement('div');
    header.className = 'search-results-header';
    header.innerHTML = `
        <h2>Search Results</h2>
        <button onclick="document.body.removeChild(document.getElementById('searchResults'))">×</button>
    `;
    searchResultsDiv.appendChild(header);

    // Create container for book results
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No books found matching your search.</p>';
    } else {
        results.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-card';
            bookDiv.dataset.id = book.id;
            bookDiv.innerHTML = `
                <div class="book-cover">
                    ${book.cover_image_url ? 
                        `<img src="${book.cover_image_url}" alt="${book.title} cover">` :
                        '<div class="no-cover">No Cover</div>'
                    }
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <p class="book-isbn">ISBN: ${book.isbn}</p>
                    <p class="book-description">${book.description}</p>
                    <p class="book-availability">${book.is_available ? 'Available' : 'Not Available'}</p>
                    <button 
                        class="borrow-button ${!book.is_available ? 'disabled' : ''}" 
                        data-book-id="${book.id}"
                        ${!book.is_available ? 'disabled' : ''}
                    >
                        ${book.is_available ? 'Borrow' : 'Not Available'}
                    </button>
                </div>
            `;
            resultsContainer.appendChild(bookDiv);
        });
    }

    searchResultsDiv.appendChild(resultsContainer);
    document.body.appendChild(searchResultsDiv);

    // Add event listeners to borrow buttons
    document.querySelectorAll('.borrow-button:not([disabled])').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const bookId = this.getAttribute('data-book-id');
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
                    // Close search results after borrowing
                    document.body.removeChild(searchResultsDiv);
                    // Redirect to borrowed books page
                    window.location.href = '/borrowed-books/';
                }
            } catch (error) {
                console.error('Failed to borrow book:', error);
                alert('Failed to borrow book');
            }
        });
    });
}