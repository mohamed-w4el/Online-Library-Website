document.addEventListener('DOMContentLoaded', function() {
    addBookCoverClickListeners();
});

function addBookCoverClickListeners() {
    // Add click listeners to book covers
    document.querySelectorAll('.book-cover').forEach(bookCover => {
        bookCover.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons or other interactive elements
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            const bookId = this.getAttribute('data-id');
            if (bookId) {
                window.location.href = `/book-info/?id=${bookId}`;
            }
        });
    });
}