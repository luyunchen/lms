import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// import { telemetryService } from '../services/telemetry';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0
  });
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track dashboard view
    // telemetryService.trackEvent('page_view', { page: 'dashboard' });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, overdueRes, activityRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/books/overdue'),
        axios.get('/api/activity')
      ]);

      setStats(statsRes.data);
      setOverdueBooks(overdueRes.data);
      setRecentActivity(activityRes.data.slice(0, 5)); // Show only 5 recent activities
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values so the dashboard still renders
      setStats({
        totalBooks: 0,
        availableBooks: 0,
        borrowedBooks: 0,
        overdueBooks: 0
      });
      setOverdueBooks([]);
      setRecentActivity([]);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1>Library Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="dashboard">
        <div className="stat-card">
          <div className="stat-number stat-total">{stats.totalBooks}</div>
          <div className="stat-label">Total Books</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number stat-available">{stats.availableBooks}</div>
          <div className="stat-label">Available</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number stat-borrowed">{stats.borrowedBooks}</div>
          <div className="stat-label">Borrowed</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number stat-overdue">{stats.overdueBooks}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="form">
        <h2 className="form-title">Quick Actions</h2>
        <div className="btn-group">
          <Link to="/books/add" className="btn btn-cta">
            Add New Book
          </Link>
          <Link to="/books" className="btn btn-primary">
            Browse Books
          </Link>
          <Link to="/activity" className="btn btn-secondary">
            View Activity Log
          </Link>
        </div>
      </div>

      {/* Overdue Books Alert */}
      {overdueBooks.length > 0 && (
        <div className="form">
          <h2 className="form-title" style={{ color: '#E74C3C' }}>
            ⚠️ Overdue Books ({overdueBooks.length})
          </h2>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Borrower</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {overdueBooks.map(book => {
                  const dueDate = new Date(book.due_date);
                  const today = new Date();
                  const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={book.id}>
                      <td>
                        <Link to={`/books/${book.id}`} style={{ color: '#1F3B4D', textDecoration: 'none' }}>
                          {book.title}
                        </Link>
                      </td>
                      <td>{book.author}</td>
                      <td>{book.borrower_name}</td>
                      <td>{formatDate(book.due_date)}</td>
                      <td style={{ color: '#E74C3C', fontWeight: 'bold' }}>
                        {daysOverdue} days
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="form">
        <h2 className="form-title">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Book</th>
                  <th>User</th>
                  <th>Date & Time</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map(activity => (
                  <tr key={activity.id}>
                    <td>
                      <span className={`status ${
                        activity.action === 'checked_out' ? 'status-borrowed' :
                        activity.action === 'checked_in' ? 'status-available' :
                        'status-borrowed'
                      }`}>
                        {activity.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {activity.book_title ? (
                        <Link to={`/books/${activity.book_id}`} style={{ color: '#1F3B4D', textDecoration: 'none' }}>
                          {activity.book_title}
                        </Link>
                      ) : 'N/A'}
                    </td>
                    <td>{activity.borrower_name || 'System'}</td>
                    <td>{formatDateTime(activity.timestamp)}</td>
                    <td>{activity.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No recent activity to display.
          </div>
        )}
        
        <div style={{ marginTop: '16px' }}>
          <Link to="/activity" className="btn btn-outline btn-small">
            View All Activity
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
