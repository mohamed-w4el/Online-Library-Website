from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('user-dashboard/', views.user_dashboard, name='user_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('books/', views.view_books, name='view_books'),
    path('books/json/', views.get_books_json, name='get_books_json'),
    path('book-details/<int:book_id>/', views.get_book_details, name='get_book_details'),
    path('book-details/', views.book_details, name='book_details'),
    path('book-info/', views.book_info, name='book_info'),
    path('add-book/', views.add_book, name='add_book'),
    path('edit-book/', views.edit_book, name='edit_book'),
    path('delete-book/', views.delete_book, name='delete_book'),
    path('borrowed-books/', views.borrowed_books, name='borrowed_books'),
    path('return-book/', views.return_book, name='return_book'),
]
