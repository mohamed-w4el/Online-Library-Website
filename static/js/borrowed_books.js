import { getBorrowedBooks, returnBook as apiReturnBook } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    const bookList = document.getElementById('borrowedBooksList');
    
    try {
        const borrowedBooksHtml = await getBorrowedBooks();
        const parser = new DOMParser();
        const doc = parser.parseFromString(borrowedBooksHtml, 'text/html');
        
        const borrowedBooks = Array.from(doc.querySelectorAll('.book-item')).map(item => ({
            id: item.dataset.id,
            book: {
                title: item.querySelector('.book-title').textContent,
                author: item.querySelector('.book-author').textContent
            },
            borrow_date: item.querySelector('.borrow-date').textContent,
            due_date: item.querySelector('.due-date').textContent,
            fine_amount: parseFloat(item.querySelector('.fine-amount')?.textContent || '0'),
            is_overdue: item.querySelector('.overdue') !== null,
            status: item.querySelector('.status').textContent
        }));
        
        if (borrowedBooks.length === 0) {
            bookList.innerHTML = '<li class="book-item">There are no borrowed books</li>';
            return;
        }

        bookList.innerHTML = borrowedBooks.map(book => `
            <li class="book-item" data-id="${book.id}">
                <div class="book-info">
                    <h3>${book.book.title}</h3>
                    <p>Author: ${book.book.author}</p>
                    <p>Borrowed on: ${new Date(book.borrow_date).toLocaleDateString()}</p>
                    <p>Due date: ${new Date(book.due_date).toLocaleDateString()}</p>
                    ${book.fine_amount > 0 ? `<p class="fine">Fine: $${book.fine_amount}</p>` : ''}
                    ${book.is_overdue ? '<p class="overdue">OVERDUE!</p>' : ''}
                </div>
                ${book.status === 'BORROWED' ? `
                    <button onclick="returnBookHandler(${book.id})" class="return-button">Return Book</button>
                ` : ''}
            </li>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch borrowed books:', error);
        bookList.innerHTML = '<li class="book-item">There are no borrowed books</li>';
    }
});

window.returnBookHandler = async function(borrowingId) {
    try {
        const response = await apiReturnBook(borrowingId);
        // Parse JSON response
        const data = JSON.parse(response);
        
        if (data.success) {
            alert(data.message);
            // Refresh the page to show updated list
            window.location.reload();
        } else {
            alert(data.error || 'Failed to return book');
        }
    } catch (error) {
        console.error('Failed to return book:', error);
        alert(error.message || 'Failed to return book');
    }
}

   