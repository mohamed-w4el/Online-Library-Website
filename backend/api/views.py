from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import logout as auth_logout, authenticate, login as auth_login
from django.utils import timezone
from .models import Book, BorrowingRecord
from django.contrib.auth.decorators import login_required
from django.db import models
import json
from datetime import timedelta

def home(request):
    return render(request, 'index.html')

def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        role = request.POST.get('role', 'user')

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return render(request, 'signup.html', {'error_message': 'Username already exists'})

        # Create new user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Set staff status based on role
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.save()

        return redirect('login')
    
    return render(request, 'signup.html')

def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Update last_login
            user.last_login = timezone.now()
            user.save()
            
            # Log the user in
            auth_login(request, user)
            
            # Return JSON response with user type
            return JsonResponse({
                'success': True,
                'is_superuser': user.is_superuser,
                'redirect_url': '/admin-dashboard/' if user.is_superuser else '/user-dashboard/'
            })
        else:
            # Authentication failed
            return JsonResponse({
                'success': False,
                'error': 'Invalid username or password'
            }, status=400)
    
    return render(request, 'login.html')

@login_required
def user_dashboard(request):
    try:
        # Get all books and group them by category
        books = Book.objects.all().order_by('category', 'title')
        
        # Group books by category
        books_by_category = {}
        for book in books:
            category = book.category or 'Uncategorized'
            if category not in books_by_category:
                books_by_category[category] = []
            
            books_by_category[category].append({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'isbn': book.isbn,
                'description': book.description,
                'is_available': book.is_available,
                'cover_image': book.cover_image.url if book.cover_image else None,
            })

        return render(request, 'user_dashboard.html', {
            'books_by_category': books_by_category
        })

    except Exception as e:
        return render(request, 'user_dashboard.html', {
            'error': str(e),
            'books_by_category': {}
        })

def admin_dashboard(request):
    return render(request, 'admindash.html')

@login_required
def view_books(request):
    try:
        # Get all books
        books = Book.objects.all().order_by('title')
        
        # Handle search if provided
        search_query = request.GET.get('search', '')
        if search_query:
            books = books.filter(
                models.Q(title__icontains=search_query) |
                models.Q(author__icontains=search_query) |
                models.Q(isbn__icontains=search_query) |
                models.Q(category__icontains=search_query)
            )

        # Prepare book data for template
        books_data = []
        for book in books:
            books_data.append({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'isbn': book.isbn,
                'category': book.category,
                'description': book.description,
                'is_available': book.is_available,
                'cover_image': book.cover_image.url if book.cover_image else None,
                'created_at': book.created_at.strftime('%Y-%m-%d %H:%M'),
            })

        return render(request, 'viewBooks.html', {
            'books': books_data,
            'search_query': search_query
        })

    except Exception as e:
        return render(request, 'viewBooks.html', {
            'error': str(e),
            'books': []
        })

@login_required
def book_details(request):
    try:
        # Get all books
        books = Book.objects.all().order_by('title')
        
        # Handle search if provided
        search_query = request.GET.get('search', '')
        if search_query:
            books = books.filter(
                models.Q(title__icontains=search_query) |
                models.Q(author__icontains=search_query) |
                models.Q(isbn__icontains=search_query) |
                models.Q(category__icontains=search_query)
            )

        # Group books by category
        books_by_category = {}
        for book in books:
            category = book.category or 'Uncategorized'
            if category not in books_by_category:
                books_by_category[category] = []
            
            books_by_category[category].append({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'isbn': book.isbn,
                'description': book.description,
                'is_available': book.is_available,
                'cover_image': book.cover_image.url if book.cover_image else None,
            })

        return render(request, 'book_details.html', {
            'books_by_category': books_by_category,
            'search_query': search_query
        })

    except Exception as e:
        return render(request, 'book_details.html', {
            'error': str(e),
            'books_by_category': {}
        })

@login_required
def book_info(request):
    try:
        book_id = request.GET.get('id')
        if not book_id:
            return render(request, 'book_info.html', {'error': 'Book ID is required'})

        book = Book.objects.get(id=book_id)
        
        # Check if the book is already borrowed by the current user
        is_borrowed_by_user = BorrowingRecord.objects.filter(
            book=book,
            user=request.user,
            return_date__isnull=True
        ).exists()

        book_data = {
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'isbn': book.isbn,
            'category': book.category,
            'description': book.description,
            'is_available': book.is_available,
            'cover_image': book.cover_image.url if book.cover_image else None,
            'is_borrowed_by_user': is_borrowed_by_user
        }

        if request.method == 'POST':
            action = request.POST.get('action')
            
            if action == 'borrow' and book.is_available:
                # Create borrowing record
                BorrowingRecord.objects.create(
                    book=book,
                    user=request.user,
                    borrow_date=timezone.now(),
                    due_date=timezone.now() + timedelta(days=14),
                    status='BORROWED'
                )
                
                # Update book availability
                book.is_available = False
                book.save()
                
                messages.success(request, 'Book borrowed successfully!')
                return redirect('borrowed_books')
            
            elif action == 'return' and is_borrowed_by_user:
                # Update borrowing record
                borrowing = BorrowingRecord.objects.get(
                    book=book,
                    user=request.user,
                    return_date__isnull=True
                )
                borrowing.return_date = timezone.now()
                borrowing.save()
                
                # Update book availability
                book.is_available = True
                book.save()
                
                messages.success(request, 'Book returned successfully!')
                return redirect('user_dashboard')

        return render(request, 'book_info.html', {'book': book_data})

    except Book.DoesNotExist:
        return render(request, 'book_info.html', {'error': 'Book not found'})
    except Exception as e:
        return render(request, 'book_info.html', {'error': str(e)})

@login_required
def add_book(request):
    if request.method == 'POST':
        try:
            # Get form data
            title = request.POST.get('title')
            author = request.POST.get('author')
            isbn = request.POST.get('isbn')
            description = request.POST.get('description')
            category = request.POST.get('category', 'OTHER')
            cover_image = request.FILES.get('cover_image')

            # Validate required fields
            if not all([title, author, isbn, description, category]):
                return JsonResponse({
                    'success': False,
                    'error': 'All fields are required'
                }, status=400)

            # Check if ISBN already exists
            if Book.objects.filter(isbn=isbn).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'A book with this ISBN already exists'
                }, status=400)

            # Create new book
            book = Book.objects.create(
                title=title,
                author=author,
                isbn=isbn,
                description=description,
                category=category,
                cover_image=cover_image,
                is_available=True
            )

            return JsonResponse({
                'success': True,
                'message': 'Book added successfully',
                'book_id': book.id
            })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

    return render(request, 'add_book.html')

@login_required
def edit_book(request):
    if request.method == 'PUT':
        try:
            # Get form data
            data = json.loads(request.body)
            book_id = data.get('id')
            title = data.get('title')
            author = data.get('author')
            isbn = data.get('isbn')
            description = data.get('description')
            category = data.get('category')

            # Validate required fields
            if not all([title, author, isbn, description, category]):
                return JsonResponse({
                    'success': False,
                    'error': 'All fields are required'
                }, status=400)

            # Get the book
            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Book not found'
                }, status=404)

            # Check if ISBN already exists (excluding current book)
            if Book.objects.filter(isbn=isbn).exclude(id=book_id).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'A book with this ISBN already exists'
                }, status=400)

            # Update book
            book.title = title
            book.author = author
            book.isbn = isbn
            book.description = description
            book.category = category
            book.save()

            return JsonResponse({
                'success': True,
                'message': 'Book updated successfully',
                'book_id': book.id
            })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

    return render(request, 'edit_book.html')

@login_required
def delete_book(request):
    if request.method == 'DELETE':
        try:
            # Get book ID from request body
            data = json.loads(request.body)
            book_id = data.get('id')

            if not book_id:
                return JsonResponse({
                    'success': False,
                    'error': 'Book ID is required'
                }, status=400)

            # Get the book
            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Book not found'
                }, status=404)

            # Check if book is currently borrowed
            if not book.is_available:
                return JsonResponse({
                    'success': False,
                    'error': 'Cannot delete a book that is currently borrowed'
                }, status=400)

            # Delete the book
            book.delete()

            return JsonResponse({
                'success': True,
                'message': 'Book deleted successfully'
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

    return render(request, 'delete_book.html')

@login_required
def borrowed_books(request):
    # Get only currently borrowed books (not returned)
    borrowings = BorrowingRecord.objects.filter(
        user=request.user,
        return_date__isnull=True
    ).order_by('-borrow_date')
    return render(request, 'borrowed_books.html', {'borrowings': borrowings})

@login_required
def return_book(request):
    if request.method == 'POST':
        borrowing_id = request.POST.get('borrowing_id')
        if not borrowing_id:
            return JsonResponse({'error': 'Borrowing ID is required'}, status=400)
        
        try:
            # Get the borrowing record
            borrowing = BorrowingRecord.objects.get(
                id=borrowing_id,
                user=request.user,
                return_date__isnull=True
            )
            
            # Update borrowing record
            borrowing.return_date = timezone.now()
            borrowing.status = 'RETURNED'
            borrowing.save()
            
            # Update book availability
            book = borrowing.book
            book.is_available = True
            book.save()
            
            return JsonResponse({'success': True, 'message': 'Book returned successfully'})
            
        except BorrowingRecord.DoesNotExist:
            return JsonResponse({'error': 'Borrowing record not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def logout(request):
    if request.method == 'POST':
        auth_logout(request)
        return redirect('home')
    return redirect('home')

@login_required
def get_books_json(request):
    try:
        # Get all books
        books = Book.objects.all().order_by('title')
        
        # Prepare book data
        books_data = []
        for book in books:
            books_data.append({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'isbn': book.isbn,
                'category': book.category,
                'description': book.description,
                'is_available': book.is_available,
                'cover_image': book.cover_image.url if book.cover_image else None,
            })

        return JsonResponse(books_data, safe=False)

    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@login_required
def get_book_details(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
        book_data = {
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'isbn': book.isbn,
            'category': book.category,
            'description': book.description,
            'is_available': book.is_available,
            'cover_image': book.cover_image.url if book.cover_image else None,
        }
        return JsonResponse(book_data)
    except Book.DoesNotExist:
        return JsonResponse({
            'error': 'Book not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)
