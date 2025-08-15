const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

// Initialize Supabase client
function initDatabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found, using in-memory storage');
    return null;
  }
  
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');
  }
  return supabase;
}

// Book operations
async function getAllBooks() {
  const client = initDatabase();
  if (!client) return getInMemoryBooks();
  
  try {
    const { data, error } = await client
      .from('books')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    return getInMemoryBooks();
  }
}

async function getBookById(id) {
  const client = initDatabase();
  if (!client) return getInMemoryBooks().find(b => b.id === parseInt(id));
  
  try {
    const { data, error } = await client
      .from('books')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching book:', error);
    return getInMemoryBooks().find(b => b.id === parseInt(id));
  }
}

async function updateBook(id, updates) {
  const client = initDatabase();
  if (!client) {
    // Update in-memory book
    const books = getInMemoryBooks();
    const bookIndex = books.findIndex(b => b.id === parseInt(id));
    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], ...updates };
      return books[bookIndex];
    }
    return null;
  }
  
  try {
    const { data, error } = await client
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
}

async function addBook(book) {
  const client = initDatabase();
  if (!client) {
    const books = getInMemoryBooks();
    const newBook = { ...book, id: Math.max(...books.map(b => b.id), 0) + 1 };
    books.push(newBook);
    return newBook;
  }
  
  try {
    const { data, error } = await client
      .from('books')
      .insert([book])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
}

// Activity operations
async function getAllActivity() {
  const client = initDatabase();
  if (!client) return getInMemoryActivity();
  
  try {
    const { data, error } = await client
      .from('activity')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching activity:', error);
    return getInMemoryActivity();
  }
}

async function addActivity(activity) {
  const client = initDatabase();
  if (!client) {
    const activities = getInMemoryActivity();
    const newActivity = { ...activity, id: Math.max(...activities.map(a => a.id), 0) + 1 };
    activities.unshift(newActivity);
    return newActivity;
  }
  
  try {
    const { data, error } = await client
      .from('activity')
      .insert([activity])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
}

// In-memory fallback data
function getInMemoryBooks() {
  return [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      status: "available",
      borrowed_by: null,
      due_date: null,
      checkout_date: null
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "9780061120084",
      status: "available",
      borrowed_by: null,
      due_date: null,
      checkout_date: null
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      status: "borrowed",
      borrowed_by: "John Doe",
      due_date: "2024-01-15",
      checkout_date: "2024-01-01"
    },
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "9780141439518",
      status: "available",
      borrowed_by: null,
      due_date: null,
      checkout_date: null
    },
    {
      id: 5,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "9780316769174",
      status: "borrowed",
      borrowed_by: "Jane Smith",
      due_date: "2024-01-20",
      checkout_date: "2024-01-06"
    }
  ];
}

function getInMemoryActivity() {
  return [
    {
      id: 1,
      action: "checkout",
      book_title: "1984",
      user_name: "John Doe",
      timestamp: "2024-01-01T10:00:00Z"
    },
    {
      id: 2,
      action: "checkout",
      book_title: "The Catcher in the Rye",
      user_name: "Jane Smith",
      timestamp: "2024-01-06T14:30:00Z"
    }
  ];
}

module.exports = {
  getAllBooks,
  getBookById,
  updateBook,
  addBook,
  getAllActivity,
  addActivity,
  initDatabase
};
