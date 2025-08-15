const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Books table
  db.run(`CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT,
    year INTEGER,
    isbn TEXT UNIQUE,
    tags TEXT,
    description TEXT,
    status TEXT DEFAULT 'available',
    borrower_id TEXT,
    borrowed_date TEXT,
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Borrowers table
  db.run(`CREATE TABLE IF NOT EXISTS borrowers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Activity log table
  db.run(`CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    book_id TEXT,
    borrower_id TEXT,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (borrower_id) REFERENCES borrowers (id)
  )`);

  // Telemetry events table
  db.run(`CREATE TABLE IF NOT EXISTS telemetry_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    event_name TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address TEXT,
    page_url TEXT,
    payload TEXT,
    duration_ms INTEGER,
    error_message TEXT
  )`);

  // Telemetry sessions table
  db.run(`CREATE TABLE IF NOT EXISTS telemetry_sessions (
    id TEXT PRIMARY KEY,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration_ms INTEGER,
    page_views INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT
  )`);

  // Performance metrics table
  db.run(`CREATE TABLE IF NOT EXISTS performance_metrics (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    session_id TEXT,
    additional_data TEXT
  )`);
});

// Helper function to log activity
function logActivity(bookId, borrowerId, action, notes = null) {
  const id = uuidv4();
  db.run(
    `INSERT INTO activity_log (id, book_id, borrower_id, action, notes) 
     VALUES (?, ?, ?, ?, ?)`,
    [id, bookId, borrowerId, action, notes]
  );
}

// API Routes

// Get all books
app.get('/api/books', (req, res) => {
  const { search, status, genre } = req.query;
  let query = `SELECT b.*, br.name as borrower_name FROM books b 
               LEFT JOIN borrowers br ON b.borrower_id = br.id WHERE 1=1`;
  const params = [];

  if (search) {
    query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (status) {
    query += ` AND b.status = ?`;
    params.push(status);
  }

  if (genre) {
    query += ` AND b.genre LIKE ?`;
    params.push(`%${genre}%`);
  }

  query += ` ORDER BY b.title`;

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single book
app.get('/api/books/:id', (req, res) => {
  const query = `SELECT b.*, br.name as borrower_name, br.email as borrower_email 
                 FROM books b 
                 LEFT JOIN borrowers br ON b.borrower_id = br.id 
                 WHERE b.id = ?`;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json(row);
  });
});

// Add new book
app.post('/api/books', (req, res) => {
  const { title, author, genre, year, isbn, tags, description } = req.body;
  const id = uuidv4();

  if (!title || !author) {
    res.status(400).json({ error: 'Title and author are required' });
    return;
  }

  const query = `INSERT INTO books (id, title, author, genre, year, isbn, tags, description) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, [id, title, author, genre, year, isbn, tags, description], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'ISBN already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }

    logActivity(id, null, 'added', 'Book added to library');
    res.status(201).json({ id, message: 'Book added successfully' });
  });
});

// Update book
app.put('/api/books/:id', (req, res) => {
  const { title, author, genre, year, isbn, tags, description } = req.body;
  const query = `UPDATE books SET title = ?, author = ?, genre = ?, year = ?, 
                 isbn = ?, tags = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;

  db.run(query, [title, author, genre, year, isbn, tags, description, req.params.id], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'ISBN already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    logActivity(req.params.id, null, 'updated', 'Book information updated');
    res.json({ message: 'Book updated successfully' });
  });
});

// Delete book
app.delete('/api/books/:id', (req, res) => {
  // Check if book is borrowed
  db.get('SELECT status FROM books WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    if (row.status === 'borrowed') {
      res.status(400).json({ error: 'Cannot delete borrowed book' });
      return;
    }

    db.run('DELETE FROM books WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      logActivity(req.params.id, null, 'deleted', 'Book removed from library');
      res.json({ message: 'Book deleted successfully' });
    });
  });
});

// Check out book
app.post('/api/books/:id/checkout', (req, res) => {
  const { borrower_name, borrower_email, borrower_phone, due_date } = req.body;
  const bookId = req.params.id;

  if (!borrower_name || !borrower_email || !due_date) {
    res.status(400).json({ error: 'Borrower name, email, and due date are required' });
    return;
  }

  // Check if book is available
  db.get('SELECT status FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    if (book.status !== 'available') {
      res.status(400).json({ error: 'Book is not available for checkout' });
      return;
    }

    // Create or get borrower
    const borrowerId = uuidv4();
    db.run(
      `INSERT OR REPLACE INTO borrowers (id, name, email, phone) VALUES (?, ?, ?, ?)`,
      [borrowerId, borrower_name, borrower_email, borrower_phone],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Update book status
        db.run(
          `UPDATE books SET status = 'borrowed', borrower_id = ?, 
           borrowed_date = CURRENT_TIMESTAMP, due_date = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [borrowerId, due_date, bookId],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            logActivity(bookId, borrowerId, 'checked_out', `Due: ${due_date}`);
            res.json({ message: 'Book checked out successfully' });
          }
        );
      }
    );
  });
});

// Check in book
app.post('/api/books/:id/checkin', (req, res) => {
  const bookId = req.params.id;

  // Check if book is borrowed
  db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    if (book.status !== 'borrowed') {
      res.status(400).json({ error: 'Book is not checked out' });
      return;
    }

    // Update book status
    db.run(
      `UPDATE books SET status = 'available', borrower_id = NULL, 
       borrowed_date = NULL, due_date = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [bookId],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        logActivity(bookId, book.borrower_id, 'checked_in', 'Book returned');
        res.json({ message: 'Book checked in successfully' });
      }
    );
  });
});

// Get borrowers
app.get('/api/borrowers', (req, res) => {
  db.all('SELECT * FROM borrowers ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get activity log
app.get('/api/activity', (req, res) => {
  const query = `SELECT a.*, b.title as book_title, br.name as borrower_name 
                 FROM activity_log a 
                 LEFT JOIN books b ON a.book_id = b.id 
                 LEFT JOIN borrowers br ON a.borrower_id = br.id 
                 ORDER BY a.timestamp DESC LIMIT 50`;

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  const stats = {};

  // Get total books
  db.get('SELECT COUNT(*) as total FROM books', (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    stats.totalBooks = result.total;

    // Get available books
    db.get('SELECT COUNT(*) as available FROM books WHERE status = "available"', (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      stats.availableBooks = result.available;

      // Get borrowed books
      db.get('SELECT COUNT(*) as borrowed FROM books WHERE status = "borrowed"', (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        stats.borrowedBooks = result.borrowed;

        // Get overdue books
        db.get('SELECT COUNT(*) as overdue FROM books WHERE status = "borrowed" AND date(due_date) < date("now")', (err, result) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          stats.overdueBooks = result.overdue;

          res.json(stats);
        });
      });
    });
  });
});

// Get autocomplete suggestions
app.get('/api/autocomplete', (req, res) => {
  const { query, type = 'all' } = req.query;
  
  if (!query || query.length < 2) {
    res.json([]);
    return;
  }

  const searchPattern = `%${query}%`;
  let suggestions = [];

  if (type === 'all' || type === 'titles') {
    db.all('SELECT DISTINCT title FROM books WHERE title LIKE ? ORDER BY title LIMIT 5', 
           [searchPattern], (err, rows) => {
      if (!err) {
        suggestions = suggestions.concat(rows.map(row => ({
          value: row.title,
          type: 'title',
          category: 'Title'
        })));
      }
      
      // Get authors if needed
      if (type === 'all' || type === 'authors') {
        db.all('SELECT DISTINCT author FROM books WHERE author LIKE ? ORDER BY author LIMIT 5', 
               [searchPattern], (err, rows) => {
          if (!err) {
            suggestions = suggestions.concat(rows.map(row => ({
              value: row.author,
              type: 'author',
              category: 'Author'
            })));
          }
          
          // Get genres if needed
          if (type === 'all' || type === 'genres') {
            db.all('SELECT DISTINCT genre FROM books WHERE genre LIKE ? AND genre IS NOT NULL ORDER BY genre LIMIT 5', 
                   [searchPattern], (err, rows) => {
              if (!err) {
                suggestions = suggestions.concat(rows.map(row => ({
                  value: row.genre,
                  type: 'genre',
                  category: 'Genre'
                })));
              }
              
              // Limit total results and send response
              res.json(suggestions.slice(0, 8));
            });
          } else {
            res.json(suggestions.slice(0, 8));
          }
        });
      } else {
        res.json(suggestions.slice(0, 8));
      }
    });
  }
});

// Telemetry API endpoints

// Create or get session
app.post('/api/telemetry/session', (req, res) => {
  const sessionId = uuidv4();
  const { userAgent, ipAddress, referrer } = req.body;

  db.run(
    `INSERT INTO telemetry_sessions (id, user_agent, ip_address, referrer) 
     VALUES (?, ?, ?, ?)`,
    [sessionId, userAgent, ipAddress || req.ip, referrer],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ sessionId });
    }
  );
});

// Log telemetry event
app.post('/api/telemetry/event', (req, res) => {
  const {
    sessionId,
    eventType,
    eventCategory,
    eventName,
    userAgent,
    ipAddress,
    pageUrl,
    payload,
    duration,
    errorMessage
  } = req.body;

  const eventId = uuidv4();

  // Insert telemetry event
  db.run(
    `INSERT INTO telemetry_events 
     (id, session_id, event_type, event_category, event_name, user_agent, ip_address, 
      page_url, payload, duration_ms, error_message) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      eventId, sessionId, eventType, eventCategory, eventName,
      userAgent, ipAddress || req.ip, pageUrl,
      payload ? JSON.stringify(payload) : null,
      duration, errorMessage
    ],
    function(err) {
      if (err) {
        console.error('Telemetry error:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      // Update session event count
      db.run(
        `UPDATE telemetry_sessions 
         SET events_count = events_count + 1, end_time = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [sessionId]
      );

      res.json({ success: true, eventId });
    }
  );
});

// Log performance metric
app.post('/api/telemetry/performance', (req, res) => {
  const { sessionId, metricType, metricName, value, unit, additionalData } = req.body;
  const metricId = uuidv4();

  db.run(
    `INSERT INTO performance_metrics 
     (id, metric_type, metric_name, value, unit, session_id, additional_data) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      metricId, metricType, metricName, value, unit, sessionId,
      additionalData ? JSON.stringify(additionalData) : null
    ],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, metricId });
    }
  );
});

// Get telemetry dashboard data
app.get('/api/telemetry/dashboard', (req, res) => {
  const { timeRange = '7d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  const startDate = new Date();
  switch (timeRange) {
    case '1d':
      startDate.setDate(now.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  const promises = [];

  // Total events
  promises.push(new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as total FROM telemetry_events 
       WHERE timestamp >= ?`,
      [startDate.toISOString()],
      (err, row) => {
        if (err) reject(err);
        else resolve({ totalEvents: row.total });
      }
    );
  }));

  // Total sessions
  promises.push(new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as total FROM telemetry_sessions 
       WHERE start_time >= ?`,
      [startDate.toISOString()],
      (err, row) => {
        if (err) reject(err);
        else resolve({ totalSessions: row.total });
      }
    );
  }));

  // Top events
  promises.push(new Promise((resolve, reject) => {
    db.all(
      `SELECT event_name, COUNT(*) as count 
       FROM telemetry_events 
       WHERE timestamp >= ? 
       GROUP BY event_name 
       ORDER BY count DESC 
       LIMIT 10`,
      [startDate.toISOString()],
      (err, rows) => {
        if (err) reject(err);
        else resolve({ topEvents: rows });
      }
    );
  }));

  // Events by category
  promises.push(new Promise((resolve, reject) => {
    db.all(
      `SELECT event_category, COUNT(*) as count 
       FROM telemetry_events 
       WHERE timestamp >= ? 
       GROUP BY event_category 
       ORDER BY count DESC`,
      [startDate.toISOString()],
      (err, rows) => {
        if (err) reject(err);
        else resolve({ eventsByCategory: rows });
      }
    );
  }));

  // Events over time (daily)
  promises.push(new Promise((resolve, reject) => {
    db.all(
      `SELECT DATE(timestamp) as date, COUNT(*) as count 
       FROM telemetry_events 
       WHERE timestamp >= ? 
       GROUP BY DATE(timestamp) 
       ORDER BY date`,
      [startDate.toISOString()],
      (err, rows) => {
        if (err) reject(err);
        else resolve({ eventsOverTime: rows });
      }
    );
  }));

  // Error events
  promises.push(new Promise((resolve, reject) => {
    db.all(
      `SELECT event_name, error_message, COUNT(*) as count 
       FROM telemetry_events 
       WHERE timestamp >= ? AND error_message IS NOT NULL 
       GROUP BY event_name, error_message 
       ORDER BY count DESC 
       LIMIT 10`,
      [startDate.toISOString()],
      (err, rows) => {
        if (err) reject(err);
        else resolve({ errorEvents: rows });
      }
    );
  }));

  // Search analytics
  promises.push(new Promise((resolve, reject) => {
    db.all(
      `SELECT 
         JSON_EXTRACT(payload, '$.query') as search_query,
         COUNT(*) as count 
       FROM telemetry_events 
       WHERE timestamp >= ? 
         AND event_category = 'search' 
         AND JSON_EXTRACT(payload, '$.query') IS NOT NULL 
       GROUP BY JSON_EXTRACT(payload, '$.query') 
       ORDER BY count DESC 
       LIMIT 10`,
      [startDate.toISOString()],
      (err, rows) => {
        if (err) reject(err);
        else resolve({ searchAnalytics: rows || [] });
      }
    );
  }));

  Promise.all(promises)
    .then(results => {
      const dashboardData = Object.assign({}, ...results);
      res.json(dashboardData);
    })
    .catch(error => {
      console.error('Dashboard data error:', error);
      res.status(500).json({ error: error.message });
    });
});

// Get detailed telemetry events
app.get('/api/telemetry/events', (req, res) => {
  const { 
    limit = 50, 
    offset = 0, 
    category, 
    eventName, 
    timeRange = '7d' 
  } = req.query;

  const now = new Date();
  const startDate = new Date();
  switch (timeRange) {
    case '1d': startDate.setDate(now.getDate() - 1); break;
    case '7d': startDate.setDate(now.getDate() - 7); break;
    case '30d': startDate.setDate(now.getDate() - 30); break;
    default: startDate.setDate(now.getDate() - 7);
  }

  let query = `
    SELECT e.*, s.start_time as session_start 
    FROM telemetry_events e 
    LEFT JOIN telemetry_sessions s ON e.session_id = s.id 
    WHERE e.timestamp >= ?
  `;
  const params = [startDate.toISOString()];

  if (category) {
    query += ` AND e.event_category = ?`;
    params.push(category);
  }

  if (eventName) {
    query += ` AND e.event_name = ?`;
    params.push(eventName);
  }

  query += ` ORDER BY e.timestamp DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Parse JSON payloads
    const events = rows.map(row => ({
      ...row,
      payload: row.payload ? JSON.parse(row.payload) : null
    }));

    res.json(events);
  });
});

// Get overdue books
app.get('/api/books/overdue', (req, res) => {
  const query = `SELECT b.*, br.name as borrower_name, br.email as borrower_email 
                 FROM books b 
                 LEFT JOIN borrowers br ON b.borrower_id = br.id 
                 WHERE b.status = 'borrowed' AND date(b.due_date) < date('now')
                 ORDER BY b.due_date`;

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
