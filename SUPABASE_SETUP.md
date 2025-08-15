# Supabase Setup Instructions

## Quick Setup Guide

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new organization (if needed)

### Step 2: Create New Project
1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `library-management-system`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### Step 3: Set Up Database Tables
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the following SQL:

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for books table
CREATE TRIGGER update_books_updated_at 
  BEFORE UPDATE ON books 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample books
INSERT INTO books (title, author, isbn, status, genre, year) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'available', 'Classic Literature', 1925),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'available', 'Fiction', 1960),
('1984', 'George Orwell', '9780451524935', 'available', 'Dystopian Fiction', 1949),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 'available', 'Romance', 1813),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'available', 'Fiction', 1951),
('Dune', 'Frank Herbert', '9780441172719', 'available', 'Science Fiction', 1965),
('The Lord of the Rings', 'J.R.R. Tolkien', '9780544003415', 'available', 'Fantasy', 1954),
('Clean Code', 'Robert C. Martin', '9780132350884', 'available', 'Technology', 2008),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'available', 'Fantasy', 1937),
('Brave New World', 'Aldous Huxley', '9780060850524', 'available', 'Dystopian Fiction', 1932);

-- Create one borrowed book for demonstration
UPDATE books SET 
  status = 'borrowed',
  borrowed_by = 'John Smith',
  due_date = CURRENT_DATE + INTERVAL '14 days',
  checkout_date = CURRENT_DATE,
  updated_at = NOW()
WHERE title = '1984';

-- Insert sample activity
INSERT INTO activity (action, book_title, book_id, borrower_name, notes) VALUES
('checked_out', '1984', (SELECT id FROM books WHERE title = '1984'), 'John Smith', 'Sample checkout for demonstration'),
('checked_out', 'The Great Gatsby', (SELECT id FROM books WHERE title = 'The Great Gatsby'), 'Jane Doe', 'Previous checkout - returned'),
('returned', 'The Great Gatsby', (SELECT id FROM books WHERE title = 'The Great Gatsby'), 'Jane Doe', 'Book returned on time');

-- Enable Row Level Security (optional but recommended)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON books FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON books FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON books FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON activity FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON activity FOR INSERT WITH CHECK (true);
```

3. Click "Run" to execute the SQL
4. Verify tables are created in the Table Editor

### Step 4: Get Your Credentials
1. Go to Settings → API
2. Copy these values:
   - **URL**: Your project URL (starts with https://...)
   - **anon public**: Your public API key (starts with eyJ...)

### Step 5: Configure Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `library-management-system`
3. Go to Settings → Environment Variables
4. Add these variables:
   
   **Variable 1:**
   - Name: `SUPABASE_URL`
   - Value: Your Supabase project URL
   - Environment: Production, Preview, Development
   
   **Variable 2:**
   - Name: `SUPABASE_ANON_KEY`
   - Value: Your Supabase anon public key
   - Environment: Production, Preview, Development

5. Click "Save" for each variable

### Step 6: Deploy
```bash
cd library-management-system
vercel --prod
```

## Verification Steps

After setup, verify everything works:

1. **Test API Connection**:
   Visit: `https://your-app.vercel.app/api/test`
   Should show: `"database": "connected"`

2. **Check Dashboard**:
   Visit your app and verify the dashboard shows:
   - Total books count
   - Available/borrowed statistics
   - Sample activity

3. **Test Book Operations**:
   - View books list
   - Check out a book
   - Return a book
   - Verify activity log updates

## Troubleshooting

### Common Issues:

1. **Database connection fails**:
   - Verify environment variables are set correctly
   - Check Supabase project is active
   - Ensure API key has correct permissions

2. **Tables not found**:
   - Re-run the SQL setup script
   - Check table names in Supabase dashboard
   - Verify SQL executed without errors

3. **Environment variables not working**:
   - Redeploy after adding variables
   - Check variable names match exactly
   - Ensure variables are set for all environments

### Getting Help:

- Supabase Documentation: https://supabase.com/docs
- Vercel Documentation: https://vercel.com/docs
- GitHub Issues: Create an issue in your repository

## Security Notes

The current setup uses Row Level Security with public access policies for simplicity. For production use, consider:

1. **Authentication**: Add user authentication
2. **Role-based Access**: Implement librarian/user roles
3. **API Rate Limiting**: Prevent abuse
4. **Input Validation**: Sanitize all inputs
5. **Audit Logging**: Track all database changes

## Next Steps

Once your database is set up:

1. **Customize Data**: Add your own books and categories
2. **Configure Notifications**: Set up email alerts for overdue books
3. **Add Features**: Implement user accounts, reservations, etc.
4. **Monitor Usage**: Use Supabase analytics to track usage
5. **Backup Strategy**: Configure regular backups

Your library management system is now ready for production use!
