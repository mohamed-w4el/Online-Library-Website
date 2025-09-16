// Base URL for all API calls
const BASE_URL = 'http://127.0.0.1:8000';

// Helper function to handle form submissions
async function handleFormSubmit(url, method, formData) {
    // Get CSRF token from cookie
    const csrftoken = getCookie('csrftoken');
    
    const response = await fetch(`${BASE_URL}${url}`, {
        method: method,
        body: formData,
        credentials: 'include',
        headers: {
            'X-CSRFToken': csrftoken,
        },
    });
    
    if (!response.ok) {
        throw new Error('Request failed');
    }
    
    return response.text();
}

// Function to get cookie value by name
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

// Auth functions
async function login(formData) {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
            'X-CSRFToken': csrftoken,
        },
    });
    
    if (!response.ok) {
        throw new Error('Request failed');
    }
    
    return response.text();
}

async function register(formData) {
    return handleFormSubmit('/signup/', 'POST', formData);
}

async function logout() {
    const formData = new FormData();
    return handleFormSubmit('/logout/', 'POST', formData);
}

// Books functions
async function getBooks() {
    const response = await fetch(`${BASE_URL}/books/`, {
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
    const response = await fetch(`${BASE_URL}/book-details/${bookId}/`, {
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
    const response = await fetch(`${BASE_URL}/book-details/?search=${encodeURIComponent(query)}`, {
        credentials: 'include',
    });
    return response.text();
}

async function borrowBook(bookId) {
    const formData = new FormData();
    formData.append('book_id', bookId);
    formData.append('action', 'borrow');
    // Send to the book info endpoint with the book id as a query param
    return handleFormSubmit(`/book-info/?id=${bookId}`, 'POST', formData);
}

async function getBorrowedBooks() {
    const response = await fetch(`${BASE_URL}/borrowed-books/`, {
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