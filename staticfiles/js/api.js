// Helper function to handle form submissions
async function handleFormSubmit(url, method, formData) {
    const response = await fetch(url, {
        method: method,
        body: formData,
        credentials: 'include',
    });
    
    if (!response.ok) {
        throw new Error('Request failed');
    }
    
    return response.text();
}

// Auth functions
async function login(formData) {
    return handleFormSubmit('/login/', 'POST', formData);
}

async function register(formData) {
    return handleFormSubmit('/signup/', 'POST', formData);
}

async function logout() {
    return handleFormSubmit('/logout/', 'POST', new FormData());
}

// Books functions
async function getBooks() {
    const response = await fetch('/books/', {
        credentials: 'include',
    });
    return response.text();
}

async function deleteBook(bookId) {
    const formData = new FormData();
    formData.append('book_id', bookId);
    return handleFormSubmit('/delete-book/', 'POST', formData);
}

async function getBookById(bookId) {
    const response = await fetch(`/book-details/${bookId}/`, {
        credentials: 'include',
    });
    return response.text();
}

async function updateBook(bookId, formData) {
    formData.append('book_id', bookId);
    return handleFormSubmit('/edit-book/', 'POST', formData);
}

async function addBook(formData) {
    return handleFormSubmit('/add-book/', 'POST', formData);
}

async function searchBooks(query) {
    const response = await fetch(`/books/?search=${encodeURIComponent(query)}`, {
        credentials: 'include',
    });
    return response.text();
}

async function borrowBook(bookId) {
    const formData = new FormData();
    formData.append('book_id', bookId);
    return handleFormSubmit('/borrow-book/', 'POST', formData);
}

async function getBorrowedBooks() {
    const response = await fetch('/borrowed-books/', {
        credentials: 'include',
    });
    return response.text();
}

async function returnBook(borrowingId) {
    const formData = new FormData();
    formData.append('borrowing_id', borrowingId);
    return handleFormSubmit('/return-book/', 'POST', formData);
}

export {
    login,
    register,
    logout,
    getBooks,
    searchBooks,
    borrowBook,
    getBorrowedBooks,
    returnBook,
    addBook,
    getBookById,
    deleteBook,
    updateBook
}; 