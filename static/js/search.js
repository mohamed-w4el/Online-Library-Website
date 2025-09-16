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
        
        const results = Array.from(doc.querySelectorAll('.book')).map(book => ({
            id: book.dataset.id,
            title: book.querySelector('.book-title').textContent,
            author: book.querySelector('.book-author').textContent,
            cover_image_url: book.querySelector('img')?.src || '',
            is_available: book.querySelector('.available') !== null
        }));
        
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
        alert('Failed to search books');
    }
}

// Expose handleSearch to global scope
window.handleSearch = handleSearch;

function updateSearchResultsDisplay(results) {
    const searchResultsDiv = document.getElementById('searchResults');
    if (!searchResultsDiv) return;

    const resultsContainer = searchResultsDiv.querySelector('.search-results-container');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No books found matching your search.</p>';
    } else {
        resultsContainer.innerHTML = '';
        results.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'search-book-card';
            bookDiv.dataset.id = book.id;
            bookDiv.innerHTML = `
                <div class="search-book-cover">
                    ${book.cover_image_url ? 
                        `<img src="${book.cover_image_url}" alt="${book.title} cover">` :
                        '<div class="search-no-cover">No Cover</div>'
                    }
                </div>
                <div class="search-book-info">
                    <h3 class="search-book-title">${book.title}</h3>
                    <p class="search-book-author">${book.author}</p>
                    <p class="search-book-availability ${book.is_available ? 'available' : 'not-available'}">${book.is_available ? 'Available' : 'Not Available'}</p>
                    <button 
                        class="search-borrow-button ${!book.is_available ? 'disabled' : ''}" 
                        data-book-id="${book.id}"
                        ${!book.is_available ? 'disabled' : ''}
                    >
                        ${book.is_available ? 'Borrow' : 'Borrowed'}
                    </button>
                </div>
            `;
            resultsContainer.appendChild(bookDiv);
        });
    }

    // Re-add event listeners to borrow buttons
    document.querySelectorAll('.search-borrow-button:not([disabled])').forEach(button => {
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
                    
                    // Get the current search query to refresh results
                    const searchInput = document.getElementById('searchInput');
                    const query = searchInput.value.trim();
                    
                    if (query) {
                        // Refresh the search results to update book status
                        try {
                            const searchResultsHtml = await searchBooks(query);
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(searchResultsHtml, 'text/html');
                            
                            const results = Array.from(doc.querySelectorAll('.book')).map(book => ({
                                id: book.dataset.id,
                                title: book.querySelector('.book-title').textContent,
                                author: book.querySelector('.book-author').textContent,
                                cover_image_url: book.querySelector('img')?.src || '',
                                is_available: book.querySelector('.available') !== null
                            }));
                            
                            // Update the display with new results
                            updateSearchResultsDisplay(results);
                        } catch (error) {
                            console.error('Failed to refresh search results:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to borrow book:', error);
                alert('Failed to borrow book');
            }
        });
    });

    // Re-add click listeners to book covers for navigation
    document.querySelectorAll('.search-book-cover').forEach(bookCover => {
        bookCover.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons or other interactive elements
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            const bookId = this.closest('.search-book-card').getAttribute('data-id');
            if (bookId) {
                window.location.href = `/book-info/?id=${bookId}`;
            }
        });
    });
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
    resultsContainer.className = 'search-results-container';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No books found matching your search.</p>';
    } else {
        results.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'search-book-card';
            bookDiv.dataset.id = book.id;
            bookDiv.innerHTML = `
                <div class="search-book-cover">
                    ${book.cover_image_url ? 
                        `<img src="${book.cover_image_url}" alt="${book.title} cover">` :
                        '<div class="search-no-cover">No Cover</div>'
                    }
                </div>
                <div class="search-book-info">
                    <h3 class="search-book-title">${book.title}</h3>
                    <p class="search-book-author">${book.author}</p>
                    <p class="search-book-availability ${book.is_available ? 'available' : 'not-available'}">${book.is_available ? 'Available' : 'Not Available'}</p>
                    <button 
                        class="search-borrow-button ${!book.is_available ? 'disabled' : ''}" 
                        data-book-id="${book.id}"
                        ${!book.is_available ? 'disabled' : ''}
                    >
                        ${book.is_available ? 'Borrow' : 'Borrowed'}
                    </button>
                </div>
            `;
            resultsContainer.appendChild(bookDiv);
        });
    }

    searchResultsDiv.appendChild(resultsContainer);
    document.body.appendChild(searchResultsDiv);

    // Add event listeners to borrow buttons
    document.querySelectorAll('.search-borrow-button:not([disabled])').forEach(button => {
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
                    
                    // Get the current search query to refresh results
                    const searchInput = document.getElementById('searchInput');
                    const query = searchInput.value.trim();
                    
                    if (query) {
                        // Refresh the search results to update book status
                        try {
                            const searchResultsHtml = await searchBooks(query);
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(searchResultsHtml, 'text/html');
                            
                            const results = Array.from(doc.querySelectorAll('.book')).map(book => ({
                                id: book.dataset.id,
                                title: book.querySelector('.book-title').textContent,
                                author: book.querySelector('.book-author').textContent,
                                cover_image_url: book.querySelector('img')?.src || '',
                                is_available: book.querySelector('.available') !== null
                            }));
                            
                            // Update the display with new results
                            updateSearchResultsDisplay(results);
                        } catch (error) {
                            console.error('Failed to refresh search results:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to borrow book:', error);
                alert('Failed to borrow book');
            }
        });
    });

    // Add click listeners to book covers for navigation
    document.querySelectorAll('.search-book-cover').forEach(bookCover => {
        bookCover.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons or other interactive elements
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            const bookId = this.closest('.search-book-card').getAttribute('data-id');
            if (bookId) {
                window.location.href = `/book-info/?id=${bookId}`;
            }
        });
    });
}