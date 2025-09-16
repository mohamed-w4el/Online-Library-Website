document.addEventListener('DOMContentLoaded', async function() {
    await fetchAndDisplayBooks();
});

async function fetchAndDisplayBooks() {
    const booksContainer = document.getElementById('books-container');
    const firstCategory = document.querySelector('.Category');
    booksContainer.innerHTML = '';

    try {
        const response = await fetch('/books/', { credentials: 'include' });

        if (!response.ok) {
            console.error('Failed to fetch books:', response.status, response.statusText);
            booksContainer.innerHTML = '<p>Error loading books.</p>';
            return;
        }

        const booksHtml = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(booksHtml, 'text/html');
        
        const books = Array.from(doc.querySelectorAll('.book')).map(book => ({
            id: book.dataset.id,
            title: book.querySelector('.book-title').textContent,
            category: book.querySelector('.book-category').textContent,
            cover_image_url: book.querySelector('.book-cover img')?.src || ''
        }));

        const booksByCategory = {};
        books.forEach(book => {
            const category = book.category || 'Uncategorized';
            if (!booksByCategory[category]) {
                booksByCategory[category] = [];
            }
            booksByCategory[category].push(book);
        });

        Object.entries(booksByCategory).forEach(([category, categoryBooks], index) => {
            const categorySection = index === 0 ? firstCategory : firstCategory.cloneNode(true);
            categorySection.querySelector('h2').textContent = `${category} Books`;
            
            const bookList = categorySection.querySelector('.book-list');
            bookList.innerHTML = '';
            
            categoryBooks.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.className = 'book';
                bookDiv.dataset.id = book.id;
                
                const bookLink = document.createElement('a');
                bookLink.href = `/book-info/${book.id}/`;
                
                const bookImage = document.createElement('img');
                bookImage.src = book.cover_image_url;
                bookImage.alt = book.title;
                
                bookLink.appendChild(bookImage);
                bookDiv.appendChild(bookLink);
                bookList.appendChild(bookDiv);
            });
            
            booksContainer.appendChild(categorySection);
        });

    } catch (error) {
        console.error('Error fetching or displaying books:', error);
        booksContainer.innerHTML = '<p>Error loading books.</p>';
    }
}