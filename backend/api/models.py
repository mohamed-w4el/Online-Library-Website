from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import os

def book_cover_path(instance, filename):
    # Generate path: media/book_covers/book_id/filename
    ext = filename.split('.')[-1]
    filename = f"cover.{ext}"
    return os.path.join('book_covers', str(instance.id), filename)

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=50, null=True)
    is_available = models.BooleanField(default=True)
    cover_image = models.ImageField(upload_to='book_covers/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.author}"

    def save(self, *args, **kwargs):
        # Only save once
        super().save(*args, **kwargs)

class BorrowingRecord(models.Model):
    STATUS_CHOICES = [
        ('NONE', 'No borrowed books'),
        ('BORROWED', 'Borrowed'),
        ('RETURNED', 'Returned'),
        ('OVERDUE', 'Overdue'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrow_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField()
    return_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='NONE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} borrowed {self.book.title}"

    def save(self, *args, **kwargs):
        # Update book availability when a record is created or updated
        if self.status == 'BORROWED':
            self.book.is_available = False
        elif self.status == 'RETURNED':
            self.book.is_available = True
            # Calculate fine if returned after due date
            if self.return_date and self.return_date > self.due_date:
                days_overdue = (self.return_date - self.due_date).days
                self.fine_amount = days_overdue * 1.00  # $1 per day fine
        elif self.status == 'OVERDUE':
            # Calculate fine for overdue books
            days_overdue = (timezone.now() - self.due_date).days
            if days_overdue > 0:
                self.fine_amount = days_overdue * 1.00  # $1 per day fine
        
        self.book.save()
        super().save(*args, **kwargs)

    def check_overdue(self):
        """Check if the book is overdue and update status accordingly"""
        if self.status == 'BORROWED' and timezone.now() > self.due_date:
            self.status = 'OVERDUE'
            self.save()
            return True
        return False

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['book', 'status']),
            models.Index(fields=['due_date']),
        ]