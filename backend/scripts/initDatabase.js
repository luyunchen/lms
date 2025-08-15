const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'library.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database with sample data...');

db.serialize(() => {
  // Sample books data
  const sampleBooks = [
    {
      id: uuidv4(),
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Classic Literature',
      year: 1960,
      isbn: '978-0-06-112008-4',
      tags: 'classic, literature, social justice',
      description: 'A gripping tale of racial injustice and childhood innocence in the American South.'
    },
    {
      id: uuidv4(),
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Classic Literature',
      year: 1925,
      isbn: '978-0-7432-7356-5',
      tags: 'classic, american literature, 1920s',
      description: 'A critique of the American Dream set in the Jazz Age.'
    },
    {
      id: uuidv4(),
      title: 'Dune',
      author: 'Frank Herbert',
      genre: 'Science Fiction',
      year: 1965,
      isbn: '978-0-441-17271-9',
      tags: 'sci-fi, space opera, politics',
      description: 'An epic science fiction novel set on the desert planet Arrakis.'
    },
    {
      id: uuidv4(),
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      genre: 'Romance',
      year: 1813,
      isbn: '978-0-14-143951-8',
      tags: 'romance, classic, regency',
      description: 'A witty exploration of manners, education, marriage, and money.'
    },
    {
      id: uuidv4(),
      title: '1984',
      author: 'George Orwell',
      genre: 'Dystopian Fiction',
      year: 1949,
      isbn: '978-0-452-28423-4',
      tags: 'dystopian, political, surveillance',
      description: 'A chilling prophecy about the future of society under totalitarian rule.'
    },
    {
      id: uuidv4(),
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      genre: 'Fantasy',
      year: 1954,
      isbn: '978-0-544-00341-5',
      tags: 'fantasy, adventure, epic',
      description: 'An epic high fantasy novel following the quest to destroy the One Ring.'
    },
    {
      id: uuidv4(),
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      genre: 'Technology',
      year: 2008,
      isbn: '978-0-596-51774-8',
      tags: 'programming, javascript, web development',
      description: 'A guide to the elegant parts of JavaScript programming language.'
    },
    {
      id: uuidv4(),
      title: 'Clean Code',
      author: 'Robert C. Martin',
      genre: 'Technology',
      year: 2008,
      isbn: '978-0-13-235088-4',
      tags: 'programming, software engineering, best practices',
      description: 'A handbook of agile software craftsmanship.'
    }
  ];

  // Sample borrowers
  const sampleBorrowers = [
    {
      id: uuidv4(),
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567'
    },
    {
      id: uuidv4(),
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 987-6543'
    }
  ];

  // Insert sample books
  const insertBook = db.prepare(`INSERT INTO books 
    (id, title, author, genre, year, isbn, tags, description) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

  sampleBooks.forEach(book => {
    insertBook.run(book.id, book.title, book.author, book.genre, 
                   book.year, book.isbn, book.tags, book.description);
  });

  insertBook.finalize();

  // Insert sample borrowers
  const insertBorrower = db.prepare(`INSERT INTO borrowers 
    (id, name, email, phone) VALUES (?, ?, ?, ?)`);

  sampleBorrowers.forEach(borrower => {
    insertBorrower.run(borrower.id, borrower.name, borrower.email, borrower.phone);
  });

  insertBorrower.finalize();

  // Make one book borrowed for testing
  const borrowedBookId = sampleBooks[0].id;
  const borrowerId = sampleBorrowers[0].id;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // Due in 2 weeks

  db.run(`UPDATE books SET status = 'borrowed', borrower_id = ?, 
           borrowed_date = datetime('now'), due_date = ? WHERE id = ?`,
          [borrowerId, dueDate.toISOString().split('T')[0], borrowedBookId]);

  // Add activity log entry
  db.run(`INSERT INTO activity_log (id, book_id, borrower_id, action, notes) 
          VALUES (?, ?, ?, 'checked_out', 'Sample checkout for testing')`,
          [uuidv4(), borrowedBookId, borrowerId]);

  console.log('Database initialized with sample data successfully!');
  console.log(`- ${sampleBooks.length} books added`);
  console.log(`- ${sampleBorrowers.length} borrowers added`);
  console.log('- 1 book checked out for testing');
});

db.close();
