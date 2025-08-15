// Vercel serverless function handler

// In-memory data store (resets on cold starts)
let books = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'available', genre: 'Classic Literature', year: 1925 },
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', status: 'available', genre: 'Fiction', year: 1960 },
  { id: '3', title: '1984', author: 'George Orwell', status: 'borrowed', genre: 'Dystopian Fiction', year: 1949, borrower_name: 'Demo User', due_date: '2025-08-28' },
  { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', status: 'available', genre: 'Romance', year: 1813 },
  { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', status: 'available', genre: 'Fiction', year: 1951 }
];

let activity = [
  { 
    id: '1', 
    action: 'checked_out', 
    book_title: '1984', 
    book_id: '3',
    borrower_name: 'Demo User',
    timestamp: new Date().toISOString(),
    notes: 'Demo checkout'
  }
];

module.exports = (req, res) => {
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
  
  // Test endpoint first
  if (url === '/api/test') {
    res.status(200).json({ 
      message: 'API is working!', 
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method
    });
    return;
  }
  
  // Calculate stats dynamically
  if (req.url === '/api/stats') {
    const totalBooks = books.length;
    const availableBooks = books.filter(b => b.status === 'available').length;
    const borrowedBooks = books.filter(b => b.status === 'borrowed').length;
    const overdueBooks = books.filter(b => 
      b.status === 'borrowed' && b.due_date && new Date(b.due_date) < new Date()
    ).length;
    
    res.status(200).json({
      totalBooks,
      availableBooks,
      borrowedBooks,
      overdueBooks
    });
    return;
  }
  
  if (req.url === '/api/books') {
    res.status(200).json(books);
    return;
  }
  
  // Handle individual book details
  if (url.match(/^\/api\/books\/\d+$/) && req.method === 'GET') {
    const bookId = parseInt(url.match(/\/api\/books\/(\d+)$/)[1]);
    console.log('Looking for book with ID:', bookId, typeof bookId);
    const book = books.find(b => b.id === bookId);
    console.log('Available book IDs:', books.map(b => ({ id: b.id, type: typeof b.id })));
    
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    res.status(200).json(book);
    return;
  }  if (req.url === '/api/books/overdue') {
    const overdueBooks = books.filter(b => 
      b.status === 'borrowed' && b.due_date && new Date(b.due_date) < new Date()
    );
    res.status(200).json(overdueBooks);
    return;
  }
  
  if (req.url === '/api/activity') {
    res.status(200).json(activity);
    return;
  }
  
  // Handle checkout requests with real logic
  if (req.url.match(/^\/api\/books\/\d+\/checkout$/) && req.method === 'POST') {
    const bookId = req.url.match(/\/api\/books\/(\d+)\/checkout/)[1];
    const book = books.find(b => b.id === bookId);
    
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    
    if (book.status !== 'available') {
      res.status(400).json({ error: 'Book is not available for checkout' });
      return;
    }
    
    // Parse request body for borrower info
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      let borrowerData;
      try {
        borrowerData = JSON.parse(body);
      } catch (e) {
        borrowerData = { name: 'Unknown User', email: '', phone: '' };
      }
      
      // Calculate due date (2 weeks from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      // Update book status
      book.status = 'borrowed';
      book.borrower_name = borrowerData.name;
      book.borrower_email = borrowerData.email;
      book.borrower_phone = borrowerData.phone;
      book.borrowed_date = new Date().toISOString().split('T')[0];
      book.due_date = dueDate.toISOString().split('T')[0];
      
      // Add to activity log
      activity.unshift({
        id: Date.now().toString(),
        action: 'checked_out',
        book_title: book.title,
        book_id: book.id,
        borrower_name: borrowerData.name,
        timestamp: new Date().toISOString(),
        notes: `Checked out to ${borrowerData.name}`
      });
      
      res.status(200).json({ 
        success: true, 
        message: `${book.title} checked out successfully to ${borrowerData.name}`,
        book: book,
        timestamp: new Date().toISOString()
      });
    });
    return;
  }
  
  // Handle checkin requests with real logic
  if (req.url.match(/^\/api\/books\/\d+\/checkin$/) && req.method === 'POST') {
    const bookId = req.url.match(/\/api\/books\/(\d+)\/checkin/)[1];
    const book = books.find(b => b.id === bookId);
    
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    
    if (book.status !== 'borrowed') {
      res.status(400).json({ error: 'Book is not currently borrowed' });
      return;
    }
    
    // Update book status
    const borrowerName = book.borrower_name;
    book.status = 'available';
    delete book.borrower_name;
    delete book.borrower_email;
    delete book.borrower_phone;
    delete book.borrowed_date;
    delete book.due_date;
    
    // Add to activity log
    activity.unshift({
      id: Date.now().toString(),
      action: 'checked_in',
      book_title: book.title,
      book_id: book.id,
      borrower_name: borrowerName,
      timestamp: new Date().toISOString(),
      notes: `Returned by ${borrowerName}`
    });
    
    res.status(200).json({ 
      success: true, 
      message: `${book.title} checked in successfully`,
      book: book,
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Handle add book requests
  if (req.url === '/api/books' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      let bookData;
      try {
        bookData = JSON.parse(body);
      } catch (e) {
        res.status(400).json({ error: 'Invalid JSON' });
        return;
      }
      
      const newBook = {
        id: (books.length + 1).toString(),
        title: bookData.title || 'Untitled',
        author: bookData.author || 'Unknown Author',
        genre: bookData.genre || 'Unknown',
        year: bookData.year || new Date().getFullYear(),
        isbn: bookData.isbn || '',
        tags: bookData.tags || '',
        description: bookData.description || '',
        status: 'available'
      };
      
      books.push(newBook);
      
      // Add to activity log
      activity.unshift({
        id: Date.now().toString(),
        action: 'added',
        book_title: newBook.title,
        book_id: newBook.id,
        borrower_name: 'System',
        timestamp: new Date().toISOString(),
        notes: `New book added: ${newBook.title}`
      });
      
      res.status(201).json({ 
        success: true, 
        message: 'Book added successfully',
        book: newBook,
        timestamp: new Date().toISOString()
      });
    });
    return;
  }
  
  // Handle borrowers endpoint
  if (req.url === '/api/borrowers') {
    res.status(200).json([
      { id: '1', name: 'Demo User', email: 'demo@example.com', phone: '555-0123' }
    ]);
    return;
  }
  
  // Default response
  res.status(404).json({ 
    error: 'Endpoint not found', 
    url: req.url, 
    method: req.method,
    availableEndpoints: [
      'GET /api/books',
      'POST /api/books',
      'POST /api/books/:id/checkout',
      'POST /api/books/:id/checkin',
      'GET /api/stats',
      'GET /api/activity',
      'GET /api/borrowers'
    ]
  });
};
