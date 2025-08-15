# Library Management System

A modern, full-stack library management system built with React and Node.js, deployed on Vercel. Features a clean, responsive interface with robust book management, borrowing tracking, and in-memory data storage.

![Library Management System](https://img.shields.io/badge/React-18.2.0-blue)
![Backend](https://img.shields.io/badge/Backend-Vercel_Serverless-black)
![Database](https://img.shields.io/badge/Storage-In_Memory-orange)
![Deployment](https://img.shields.io/badge/Deployment-Vercel-black)

## 🌟 Live Demo

**🔗 [Live Application](https://lms-3bn2b2vne-luyunchen04-3420s-projects.vercel.app)**

## ✨ Features

### 📚 Core Functionality
- **Book Management**: Add, view, and manage books with detailed metadata
- **Check-in/Check-out**: Real-time borrowing status with due dates
- **In-Memory Storage**: Fast, lightweight data storage (resets on deployment)
- **Activity Tracking**: Complete audit trail of all library operations
- **Overdue Detection**: Automatic identification of overdue books

### 🎨 UI/UX Highlights
- **Clean Design**: Modern, intuitive interface optimized for usability
- **Status Indicators**: Color-coded book status (Available/Borrowed/Overdue)
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant status changes across the application

### 📊 Dashboard Features
- **Statistics Overview**: Total, available, borrowed, and overdue book counts
- **Recent Activity**: Latest checkouts and returns
- **Quick Actions**: Fast access to common operations

## 🚀 Technology Stack

### Frontend
- **React 18.2** - Modern UI framework with hooks
- **React Router** - Client-side routing
- **CSS3** - Custom responsive styling

### Backend
- **Vercel Serverless Functions** - Scalable backend API
- **Node.js** - JavaScript runtime
- **In-Memory Storage** - Fast, simple data storage
- **CORS** - Cross-origin resource sharing

### Data Storage
- **In-Memory Arrays** - Simple, fast storage solution
- **Session-based** - Data persists during serverless function lifecycle
- **Demo Data** - Pre-loaded sample books and activity

## 🚀 Quick Deploy

### One-Click Deploy to Vercel

1. **Fork this repository**
2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your forked repository
   - Click "Deploy"

3. **That's it!** Your library management system is live.

## 🛠 Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd library-management-system
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   
   # Install API dependencies
   cd api
   npm install
   cd ..
   ```

2. **Start Development**
   ```bash
   # Frontend (runs on http://localhost:3000)
   cd frontend
   npm start
   
   # For local API testing (optional)
   cd api
   npm start
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001 (if running locally)

## 📚 Sample Data

The system comes pre-loaded with:

### Books (5 titles)
- **The Great Gatsby** by F. Scott Fitzgerald (Available)
- **To Kill a Mockingbird** by Harper Lee (Available)
- **1984** by George Orwell (Borrowed - Demo)
- **Pride and Prejudice** by Jane Austen (Available)
- **The Catcher in the Rye** by J.D. Salinger (Available)

### Activity Log
- Sample checkout activity for demonstration
- Shows checkout/return operations
- Includes borrower information and timestamps

## 📚 API Endpoints

### Books
- `GET /api/books` - List all books
- `POST /api/books` - Add new book
- `GET /api/books/:id` - Get book details
- `POST /api/checkout` - Check out book
- `POST /api/return` - Return book

### Statistics & Data
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/activity` - Activity log
- `GET /api/books/overdue` - Overdue books
- `GET /api/test` - API health check

## 🎨 Design System

### Color Palette
- **Primary**: `#1F3B4D` (Deep Navy)
- **Secondary**: `#2A7F6F` (Teal Green)
- **Action**: `#F2A541` (Golden Yellow)
- **Background**: `#F9F9F7` (Warm Light Gray)

### Status Colors
- **Available**: Green (`#2A7F6F`)
- **Borrowed**: Orange (`#F2A541`)
- **Overdue**: Red (`#E74C3C`)

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

## 💾 Data Persistence

### Current Setup
- **In-Memory Storage**: Data stored in JavaScript arrays
- **Session Persistence**: Data persists while serverless function is active
- **Reset Behavior**: Data resets on new deployments or cold starts
- **Demo Friendly**: Perfect for demonstrations and testing

### Benefits
- **Fast Performance**: No database overhead
- **Simple Setup**: No external dependencies
- **Cost Effective**: No database hosting costs
- **Zero Configuration**: Works immediately after deployment

### Limitations
- **Data Loss**: Data resets on function restarts
- **No Persistence**: Changes don't survive deployments
- **Single Instance**: No data sharing between function instances

## 🚀 Usage Guide

### Adding Books
1. Navigate to the application
2. Use the "Add Book" feature
3. Fill in book details (title, author, genre, year, ISBN)
4. Click "Add Book" to save

### Managing Checkouts
1. View available books in the books list
2. Click "Check Out" on any available book
3. Enter borrower name
4. Confirm checkout (due date automatically set to 2 weeks)

### Returning Books
1. Find borrowed books in the list
2. Click "Return" on the borrowed book
3. Confirm return operation
4. Book becomes available again

### Viewing Activity
- Dashboard shows recent activity
- Activity log shows complete checkout/return history
- Statistics show current library status

## 🚀 Future Enhancements

### Easy Upgrades
- [ ] Add persistent database (SQLite, PostgreSQL, MongoDB)
- [ ] User authentication and roles
- [ ] Email notifications for due dates
- [ ] Book reservation system
- [ ] Barcode scanning support
- [ ] Advanced search and filtering
- [ ] Data export (CSV, PDF)
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Real-time updates with WebSockets
- [ ] Offline mode with sync
- [ ] Performance optimization
- [ ] Enhanced error handling
- [ ] Comprehensive testing suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Vercel** - Excellent serverless platform
- **React Team** - Amazing frontend framework
- Design inspired by modern library systems
- Community feedback and contributions

---

**Built with ❤️ for simple, effective library management**

## ✨ Features

### 📚 Core Functionality
- **Book Management**: Add, view, and manage books with detailed metadata
- **Check-in/Check-out**: Real-time borrowing status with due dates
- **Persistent Storage**: Data persists between sessions using PostgreSQL
- **Activity Tracking**: Complete audit trail of all library operations
- **Overdue Detection**: Automatic identification of overdue books

### 🎨 UI/UX Highlights
- **Clean Design**: Modern, intuitive interface optimized for usability
- **Status Indicators**: Color-coded book status (Available/Borrowed/Overdue)
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant status changes across the application

### 📊 Dashboard Features
- **Statistics Overview**: Total, available, borrowed, and overdue book counts
- **Recent Activity**: Latest checkouts and returns
- **Quick Actions**: Fast access to common operations

## 🚀 Technology Stack

### Frontend
- **React 18.2** - Modern UI framework with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **CSS3** - Custom responsive styling

### Backend
- **Vercel Serverless Functions** - Scalable backend API
- **Node.js** - JavaScript runtime
- **Supabase** - PostgreSQL database with real-time features
- **CORS** - Cross-origin resource sharing

### Database
- **Supabase PostgreSQL** - Managed database with:
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Automatic backups
  - Free tier with generous limits

## 📋 Database Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Wait for project to initialize (~2 minutes)

### 2. Set Up Database Tables

In your Supabase SQL Editor, run:

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
('The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'available', 'Fiction', 1951),
('Dune', 'Frank Herbert', '9780441172719', 'available', 'Science Fiction', 1965),
('The Lord of the Rings', 'J.R.R. Tolkien', '9780544003415', 'available', 'Fantasy', 1954),
('Clean Code', 'Robert C. Martin', '9780132350884', 'available', 'Technology', 2008);

-- Update one book to be borrowed (for demo)
UPDATE books SET 
  borrowed_by = 'Demo User',
  due_date = CURRENT_DATE + INTERVAL '14 days',
  checkout_date = CURRENT_DATE
WHERE id = 3;

-- Insert sample activity
INSERT INTO activity (action, book_title, book_id, borrower_name, notes) VALUES
('checked_out', '1984', 3, 'Demo User', 'Demo checkout for testing');
```

### 3. Get Database Credentials

1. Go to Project Settings → API
2. Copy your:
   - **Project URL** (SUPABASE_URL)
   - **Public anon key** (SUPABASE_ANON_KEY)

### 4. Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase public key

### 5. Deploy

```bash
vercel --prod
```

## 🛠 Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for database)

### Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd library-management-system
   
   # Install API dependencies
   cd api
   npm install
   cd ..
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

2. **Environment Variables**
   
   Create `api/.env`:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start Development**
   ```bash
   # Frontend (runs on http://localhost:3000)
   cd frontend
   npm start
   
   # API (for local testing only - use Vercel for deployment)
   cd api
   npm start
   ```

## 📚 API Endpoints

### Books
- `GET /api/books` - List all books
- `POST /api/books` - Add new book
- `GET /api/books/:id` - Get book details
- `POST /api/checkout` - Check out book
- `POST /api/return` - Return book

### Statistics & Data
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/activity` - Activity log
- `GET /api/books/overdue` - Overdue books
- `GET /api/test` - API health check

## 🚀 Deployment

This project is optimized for Vercel deployment:

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel
   - Configure environment variables

2. **Automatic Deployment**
   - Every push to main branch triggers deployment
   - Serverless functions automatically scaled
   - Global CDN for fast worldwide access

3. **Custom Domain** (Optional)
   - Add custom domain in Vercel settings
   - Automatic SSL certificate
   - DNS configuration assistance

## 💾 Data Persistence

### Supabase Benefits
- **Persistent Storage**: Data survives serverless function restarts
- **Real-time Updates**: Live data synchronization
- **Automatic Backups**: Daily backups with point-in-time recovery
- **Scalability**: Handles traffic spikes automatically
- **Security**: Row Level Security and API authentication

### Fallback Mode
If database is unavailable, the system automatically falls back to in-memory storage for basic functionality.

## 🎨 Design System

### Color Palette
- **Primary**: `#1F3B4D` (Deep Navy)
- **Secondary**: `#2A7F6F` (Teal Green)
- **Action**: `#F2A541` (Golden Yellow)
- **Background**: `#F9F9F7` (Warm Light Gray)

### Status Colors
- **Available**: Green (`#2A7F6F`)
- **Borrowed**: Orange (`#F2A541`)
- **Overdue**: Red (`#E74C3C`)

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

## 🚀 Future Enhancements

### Planned Features
- [ ] User authentication and roles
- [ ] Email notifications for due dates
- [ ] Book reservation system
- [ ] Barcode scanning support
- [ ] Advanced search and filtering
- [ ] Data export (CSV, PDF)
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Real-time updates with Supabase subscriptions
- [ ] Offline mode with sync
- [ ] Performance optimization
- [ ] Enhanced error handling
- [ ] Comprehensive testing suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Supabase** - Excellent PostgreSQL database service
- **Vercel** - Seamless deployment platform
- **React Team** - Amazing frontend framework
- Design inspired by modern library systems

---

**Built with ❤️ for efficient library management**

## ✨ Features

### 📚 Core Functionality
- **Book Management**: Add, edit, delete books with detailed metadata
- **Check-in/Check-out**: Track borrowing status with due dates
- **Intelligent Search**: Advanced autocomplete with fuzzy matching and typo tolerance
- **Real-time Suggestions**: Smart suggestions for titles, authors, and genres
- **Overdue Tracking**: Automatic overdue detection with visual indicators

### 🎨 UI/UX Highlights
- **Clean Design**: Minimal, intuitive interface based on professional style guide
- **Status Colors**: Green (Available), Orange (Borrowed), Red (Overdue)
- **Responsive Layout**: Mobile-first design that works on all devices
- **Real-time Updates**: Instant status updates across the system

### 📊 Management Features
- **Dashboard**: Overview with key statistics and recent activity
- **Activity Log**: Complete audit trail of all library operations
- **Borrower Management**: Track who has which books
- **Bulk Operations**: Efficient batch processing capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-management-system
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies (for running both frontend and backend together)
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

3. **Initialize Database with Sample Data**
   ```bash
   cd backend
   npm run init-db
   cd ..
   ```

4. **Start Development Environment**
   ```bash
   # Start both frontend and backend together
   npm run dev
   ```
   
   **Or start them separately:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   # Backend runs on http://localhost:5000
   
   # Terminal 2 - Frontend  
   cd frontend
   npm start
   # Frontend runs on http://localhost:3000
   ```

### Sample Data

After running `npm run init-db`, your database will include:
- **8 sample books** across various genres (classics, sci-fi, fantasy, technology)
- **2 sample borrowers** for testing checkout functionality
- **1 book checked out** to demonstrate overdue tracking

**Sample Books Include:**
- To Kill a Mockingbird by Harper Lee
- The Great Gatsby by F. Scott Fitzgerald  
- Dune by Frank Herbert
- Pride and Prejudice by Jane Austen
- 1984 by George Orwell
- The Lord of the Rings by J.R.R. Tolkien
- JavaScript: The Good Parts by Douglas Crockford
- Clean Code by Robert C. Martin

### Vercel Deployment

For production deployment on Vercel, see the [Deployment Guide](DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Deploy automatically with our pre-configured `vercel.json`

🔗 **Live Demo**: [Your App URL](https://your-app.vercel.app)

### First Time Setup

The system includes comprehensive sample data for immediate testing and demonstration. After running `npm run init-db`, you'll have a fully functional library with:
- 8 diverse sample books spanning multiple genres
- 2 sample borrowers with contact information  
- 1 book in "borrowed" status for testing overdue functionality
- Complete activity log showing checkout history

This allows you to immediately explore all features without needing to manually add data.

## 📖 Usage Guide

### Adding Books
1. Navigate to "Add Book" from the main menu
2. Fill in required fields (Title, Author)
3. Optional: Add genre, year, ISBN, tags, and description
4. Click "Add Book" to save

### Managing Borrowers
1. Go to "Books" section
2. Click "Check Out" on any available book
3. Enter borrower information
4. Set due date (defaults to 2 weeks)
5. Confirm checkout

### Searching Books
- Use the search bar to find books by title, author, or ISBN
- Filter by status (Available, Borrowed, Overdue)
- Filter by genre
- Combine filters for precise results

### Dashboard Insights
- View total, available, borrowed, and overdue book counts
- See overdue books requiring attention
- Review recent library activity

## 🛠 Technology Stack

### Frontend
- **React 18.2** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with CSS variables

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Database Schema
```sql
-- Books table
books (id, title, author, genre, year, isbn, tags, description, status, borrower_id, borrowed_date, due_date, created_at, updated_at)

-- Borrowers table
borrowers (id, name, email, phone, created_at)

-- Activity log table
activity_log (id, book_id, borrower_id, action, timestamp, notes)
```

## 🎨 Design System

### Color Palette
- **Primary**: `#1F3B4D` (Deep Navy) - Headers, navigation
- **Secondary**: `#2A7F6F` (Teal Green) - Success states, accents
- **CTA**: `#F2A541` (Golden Yellow) - Action buttons
- **Background**: `#F9F9F7` (Warm Light Gray) - Page backgrounds
- **Text**: `#333333` (Dark Gray), `#666666` (Medium Gray)

### Status Colors
- **Available**: Green (`#2A7F6F`)
- **Borrowed**: Orange (`#F2A541`)
- **Overdue**: Red (`#E74C3C`)

## 📱 Responsive Design

The system is fully responsive with breakpoints:
- **Desktop**: 1200px+ (Full layout)
- **Tablet**: 768px-1199px (Adapted layout)
- **Mobile**: <768px (Stacked layout)

All touch targets meet accessibility standards (44px minimum).

## 🔧 API Endpoints

### Books
- `GET /api/books` - List all books with filtering
- `POST /api/books` - Add new book
- `GET /api/books/:id` - Get book details
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `POST /api/books/:id/checkout` - Check out book
- `POST /api/books/:id/checkin` - Check in book

### Statistics & Reports
- `GET /api/stats` - Dashboard statistics
- `GET /api/books/overdue` - List overdue books
- `GET /api/activity` - Activity log
- `GET /api/borrowers` - List borrowers

## 🔮 Future Enhancements

The project structure supports easy addition of:

### ✅ **Autocomplete (Implemented)**
- Real-time search suggestions with fuzzy matching
- Smart title, author, and genre completion
- Typo-tolerant search using Levenshtein distance
- Keyboard navigation and visual highlighting

###  **Deployment Ready**
- Vercel-optimized configuration
- Serverless backend deployment
- Production environment setup
- Comprehensive deployment guide

### Additional Features (Roadmap)
- [ ] User authentication and roles
- [ ] Email notifications for due dates
- [ ] Book reservations system
- [ ] Barcode scanning support
- [ ] Print receipts and reports
- [ ] Data export (CSV, PDF)
- [ ] Advanced reporting dashboard

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Environment Variables
Create `.env` files for configuration:

**Backend (.env)**
```
PORT=5000
DB_PATH=./library.db
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspired by modern library management systems
- Color palette optimized for accessibility
- UI/UX patterns based on user research and best practices

---

**Built with ❤️ for efficient library management**
