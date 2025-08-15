// Vercel serverless function handler with database support
const { 
  getAllBooks, 
  getBookById, 
  updateBook, 
  addBook, 
  getAllActivity, 
  addActivity 
} = require('./database');

module.exports = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }
  
  // Parse URL to remove query parameters
  const url = req.url.split('?')[0];
  console.log('Parsed URL:', url);
  
  try {
    // Test endpoint first
    if (url === '/api/test') {
      res.status(200).json({ 
        message: 'API with database is working!', 
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        database: process.env.SUPABASE_URL ? 'connected' : 'fallback'
      });
      return;
    }

    // Dashboard stats
    if (url === '/api/dashboard') {
      const books = await getAllBooks();
      const availableBooks = books.filter(b => b.status === 'available').length;
      const borrowedBooks = books.filter(b => b.status === 'borrowed').length;
      const overdueBooks = books.filter(b => 
        b.status === 'borrowed' && b.due_date && new Date(b.due_date) < new Date()
      ).length;

      res.status(200).json({
        availableBooks,
        borrowedBooks,
        overdueBooks
      });
      return;
    }

    // All books endpoint
    if (url === '/api/books' && req.method === 'GET') {
      const books = await getAllBooks();
      res.status(200).json(books);
      return;
    }

    // Add new book
    if (url === '/api/books' && req.method === 'POST') {
      const bookData = JSON.parse(req.body || '{}');
      const newBook = await addBook({
        ...bookData,
        status: 'available',
        borrowed_by: null,
        due_date: null,
        checkout_date: null
      });
      
      res.status(201).json(newBook);
      return;
    }

    // Handle individual book details
    if (url.match(/^\/api\/books\/\d+$/) && req.method === 'GET') {
      const bookId = parseInt(url.match(/\/api\/books\/(\d+)$/)[1]);
      console.log('Looking for book with ID:', bookId, typeof bookId);
      
      const book = await getBookById(bookId);
      console.log('Found book:', book ? book.title : 'Not found');
      
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      res.status(200).json(book);
      return;
    }

    // Overdue books
    if (url === '/api/books/overdue') {
      const books = await getAllBooks();
      const overdueBooks = books.filter(b => 
        b.status === 'borrowed' && b.due_date && new Date(b.due_date) < new Date()
      );
      res.status(200).json(overdueBooks);
      return;
    }

    // Activity endpoint
    if (url === '/api/activity') {
      const activity = await getAllActivity();
      res.status(200).json(activity);
      return;
    }

    // Checkout book
    if (url === '/api/checkout' && req.method === 'POST') {
      const { bookId, borrowerName } = JSON.parse(req.body || '{}');
      
      if (!bookId || !borrowerName) {
        res.status(400).json({ error: 'Book ID and borrower name are required' });
        return;
      }

      const book = await getBookById(bookId);
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      if (book.status === 'borrowed') {
        res.status(400).json({ error: 'Book is already checked out' });
        return;
      }

      // Calculate due date (2 weeks from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Update book status
      const updatedBook = await updateBook(bookId, {
        status: 'borrowed',
        borrowed_by: borrowerName,
        due_date: dueDate.toISOString().split('T')[0],
        checkout_date: new Date().toISOString().split('T')[0]
      });

      // Add activity record
      await addActivity({
        action: 'checked_out',
        book_title: book.title,
        book_id: bookId,
        borrower_name: borrowerName,
        timestamp: new Date().toISOString(),
        notes: `Checked out to ${borrowerName}`
      });

      res.status(200).json({ 
        message: 'Book checked out successfully', 
        book: updatedBook 
      });
      return;
    }

    // Return book
    if (url === '/api/return' && req.method === 'POST') {
      const { bookId } = JSON.parse(req.body || '{}');
      
      if (!bookId) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      const book = await getBookById(bookId);
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      if (book.status !== 'borrowed') {
        res.status(400).json({ error: 'Book is not currently checked out' });
        return;
      }

      const borrowerName = book.borrowed_by;

      // Update book status
      const updatedBook = await updateBook(bookId, {
        status: 'available',
        borrowed_by: null,
        due_date: null,
        checkout_date: null
      });

      // Add activity record
      await addActivity({
        action: 'returned',
        book_title: book.title,
        book_id: bookId,
        borrower_name: borrowerName,
        timestamp: new Date().toISOString(),
        notes: `Returned by ${borrowerName}`
      });

      res.status(200).json({ 
        message: 'Book returned successfully', 
        book: updatedBook 
      });
      return;
    }

    // Default 404 for unknown routes
    res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
