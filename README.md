# Mini Library Management System

A modern, fullstack library management system built with React and Node.js. Features a clean, responsive interface with robust book management, borrowing tracking, and search capabilities.

![Library Management System](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/Database-SQLite-lightgrey)

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

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run init-db
   npm start
   ```
   The backend will start on `http://localhost:5000`

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The frontend will start on `http://localhost:3000`

### Vercel Deployment

For production deployment on Vercel, see the [Deployment Guide](DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Deploy automatically with our pre-configured `vercel.json`

🔗 **Live Demo**: [Your App URL](https://your-app.vercel.app)

### First Time Setup

The system includes sample data for testing. After running `npm run init-db`, you'll have:
- 8 sample books across various genres
- 2 sample borrowers
- 1 book checked out for testing overdue functionality

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

### 📊 **Telemetry (Implemented)**
- Comprehensive analytics and usage insights
- Real-time event tracking and session management
- Performance monitoring and error tracking
- Interactive dashboard with charts and metrics
- Search analytics and user behavior insights

### 🚀 **Deployment Ready**
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
