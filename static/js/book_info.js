import { borrowBook } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Borrow Book button handler
    const borrowBtn = document.getElementById('borrowBookBtn');
    if (borrowBtn) {
        const bookId = borrowBtn.getAttribute('data-book-id');
        borrowBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                await borrowBook(bookId);
                
                // Update status on the page
                const statusSpan = document.querySelector('.book-availability');
                if (statusSpan) {
                    statusSpan.textContent = 'Borrowed';
                    statusSpan.classList.remove('available');
                    statusSpan.classList.add('unavailable');
                }
                borrowBtn.textContent = 'Currently Borrowed';
                borrowBtn.classList.add('disabled');
                borrowBtn.disabled = true;
                let msg = document.createElement('div');
                msg.className = 'success-message';
                msg.innerHTML = 'Book borrowed successfully! <a href="/borrowed-books/">Go to My Books</a>';
                borrowBtn.parentNode.appendChild(msg);
            } catch (error) {
                console.error('Failed to borrow book:', error);
                alert(error.message || 'Failed to borrow book');
            }
        });
    }

    // Return Book button handler
    const returnBtn = document.getElementById('returnBookBtn');
    if (returnBtn) {
        const bookId = returnBtn.getAttribute('data-book-id');
        returnBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const formData = new FormData();
                formData.append('action', 'return');
                // Always get CSRF token from cookie
                const csrftoken = getCookie('csrftoken');
                const response = await fetch(window.location.pathname, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                    headers: { 'X-CSRFToken': csrftoken },
                });
                if (!response.ok) {
                    let errorMsg = 'Request failed';
                    try {
                        errorMsg = await response.text();
                    } catch (e) {}
                    throw new Error(errorMsg);
                }
                alert('Book returned successfully!');
                window.location.href = '/user-dashboard/';
            } catch (error) {
                console.error('Failed to return book:', error);
                alert(error.message || 'Failed to return book');
            }
        });
    }
});
