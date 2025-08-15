# Database Setup Guide

This library management system now supports persistent data storage using Supabase (PostgreSQL). Follow these steps to set up the database:

## Option 1: Supabase Setup (Recommended - Free Tier Available)

### 1. Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Create Database Tables

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Create books table
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'borrowed')),
  borrowed_by VARCHAR(255),
  due_date DATE,
  checkout_date DATE,
  genre VARCHAR(100),
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity table
CREATE TABLE activity (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  book_title VARCHAR(255) NOT NULL,
  book_id INTEGER REFERENCES books(id),
  borrower_name VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Insert sample books
INSERT INTO books (title, author, isbn, status, genre, year) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'available', 'Classic Literature', 1925),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'available', 'Fiction', 1960),
('1984', 'George Orwell', '9780451524935', 'borrowed', 'Dystopian Fiction', 1949),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 'available', 'Romance', 1813),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'available', 'Fiction', 1951);

-- Update one book to be borrowed
UPDATE books SET 
  borrowed_by = 'Demo User',
  due_date = CURRENT_DATE + INTERVAL '14 days',
  checkout_date = CURRENT_DATE
WHERE id = 3;

-- Insert sample activity
INSERT INTO activity (action, book_title, book_id, borrower_name, notes) VALUES
('checked_out', '1984', 3, 'Demo User', 'Demo checkout for testing');
```

### 3. Get Your Credentials
1. Go to Project Settings → API
2. Copy your:
   - Project URL (SUPABASE_URL)
   - Public anon key (SUPABASE_ANON_KEY)

### 4. Configure Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase public key

### 5. Deploy
```bash
vercel --prod
```

## Fallback Mode

If no database credentials are provided, the system will automatically fall back to in-memory storage (data resets on serverless function restart).

## Local Development

For local development, create a `.env` file in the `api` directory:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Features with Database

✅ **Persistent Data**: Data survives serverless function restarts
✅ **Real-time Updates**: Changes are immediately reflected
✅ **Activity Logging**: All checkouts/returns are tracked
✅ **Book Management**: Add, update, and manage books
✅ **Search & Filter**: Efficient database queries
✅ **Overdue Tracking**: Automatic overdue book detection

## Alternative Database Options

If you prefer other databases:
- **PlanetScale** (MySQL-compatible)
- **MongoDB Atlas** (NoSQL)
- **Railway PostgreSQL**
- **Neon** (PostgreSQL)

The database module (`api/database.js`) can be adapted for other providers.
