import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/activity');
      setActivities(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionDisplay = (action) => {
    const actionMap = {
      'added': 'Book Added',
      'updated': 'Book Updated',
      'deleted': 'Book Deleted',
      'checked_out': 'Checked Out',
      'checked_in': 'Checked In'
    };
    return actionMap[action] || action;
  };

  const getActionClass = (action) => {
    switch (action) {
      case 'added':
        return 'status-available';
      case 'checked_out':
        return 'status-borrowed';
      case 'checked_in':
        return 'status-available';
      case 'updated':
        return 'status-borrowed';
      case 'deleted':
        return 'status-overdue';
      default:
        return 'status-borrowed';
    }
  };

  if (loading) {
    return <div className="loading">Loading activity log...</div>;
  }

  return (
    <div>
      <h1>Activity Log</h1>
      
      <div className="form">
        <div className="form-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent Library Activity</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
            {activities.length} total activities
          </span>
        </div>

        {activities.length > 0 ? (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Action</th>
                  <th>Book</th>
                  <th>User</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(activity => (
                  <tr key={activity.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatDateTime(activity.timestamp)}
                    </td>
                    <td>
                      <span className={`status ${getActionClass(activity.action)}`}>
                        {getActionDisplay(activity.action)}
                      </span>
                    </td>
                    <td>
                      {activity.book_title ? (
                        activity.book_id ? (
                          <Link 
                            to={`/books/${activity.book_id}`} 
                            style={{ 
                              color: 'var(--primary-color)', 
                              textDecoration: 'none' 
                            }}
                          >
                            {activity.book_title}
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {activity.book_title} (deleted)
                          </span>
                        )
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          N/A
                        </span>
                      )}
                    </td>
                    <td>
                      {activity.borrower_name || (
                        <span style={{ 
                          color: 'var(--text-secondary)', 
                          fontStyle: 'italic' 
                        }}>
                          System
                        </span>
                      )}
                    </td>
                    <td>
                      {activity.notes || (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Activity Yet</h3>
            <p>Library activities will appear here as books are added, borrowed, and returned.</p>
            <Link to="/books/add" className="btn btn-cta">
              Add Your First Book
            </Link>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      {activities.length > 0 && (
        <div className="form">
          <h2 className="form-title">Activity Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {['added', 'checked_out', 'checked_in', 'updated', 'deleted'].map(action => {
              const count = activities.filter(a => a.action === action).length;
              return (
                <div key={action} className="stat-card" style={{ padding: '16px' }}>
                  <div className={`stat-number ${getActionClass(action)}`} style={{ fontSize: '1.5rem' }}>
                    {count}
                  </div>
                  <div className="stat-label">
                    {getActionDisplay(action)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ marginTop: '32px' }}>
        <Link to="/" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Activity;
