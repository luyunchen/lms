import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import TelemetryManager from '../components/TelemetryManager';
import { telemetryService } from '../services/telemetry';

const TelemetryDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get(`/api/telemetry/dashboard?timeRange=${timeRange}`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  }, [timeRange]);

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        limit: 20
      });
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await api.get(`/api/telemetry/events?${params}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [timeRange, selectedCategory]);

  useEffect(() => {
    // Track dashboard view
    telemetryService.trackEvent('page_view', { page: 'telemetry_dashboard' });
    
    fetchDashboardData();
    fetchEvents();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange, selectedCategory, fetchDashboardData, fetchEvents]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventIcon = (category) => {
    const icons = {
      navigation: '🧭',
      search: '🔍',
      book: '📚',
      interaction: '👆',
      error: '❌',
      feature: '⚡',
      performance: '📊'
    };
    return icons[category] || '📊';
  };

  if (loading) {
    return <div className="loading">Loading telemetry dashboard...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>📊 Analytics Dashboard</h1>
        <div className="btn-group">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button 
            onClick={() => {
              fetchDashboardData();
              fetchEvents();
            }}
            className="btn btn-primary btn-small"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Offline Telemetry Manager */}
      <TelemetryManager />

      {/* Backend Analytics (Optional - when server is available) */}
      {dashboardData && (
        <>
          <div style={{ 
            borderTop: '2px solid var(--border-color)', 
            marginTop: '32px', 
            paddingTop: '32px' 
          }}>
            <h2 style={{ marginBottom: '24px' }}>🌐 Server Analytics</h2>
            
            {/* Summary Stats */}
            <div className="dashboard">
              <div className="stat-card">
                <div className="stat-number stat-total">{formatNumber(dashboardData.totalEvents)}</div>
                <div className="stat-label">Total Events</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number stat-available">{formatNumber(dashboardData.totalSessions)}</div>
                <div className="stat-label">Sessions</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number stat-borrowed">
                  {dashboardData.totalSessions > 0 
                    ? Math.round(dashboardData.totalEvents / dashboardData.totalSessions)
                    : 0}
                </div>
                <div className="stat-label">Events/Session</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number stat-overdue">{dashboardData.errorEvents?.length || 0}</div>
                <div className="stat-label">Error Events</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Show message if no backend data */}
      {!dashboardData && !loading && (
        <div style={{ 
          borderTop: '2px solid var(--border-color)', 
          marginTop: '32px', 
          paddingTop: '32px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <h2>🌐 Server Analytics</h2>
          <p>Backend telemetry server is not available. Using offline mode only.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* Events by Category */}
        {dashboardData?.eventsByCategory && (
          <div className="form">
            <h2 className="form-title">Events by Category</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {dashboardData.eventsByCategory.map(item => (
                <div 
                  key={item.event_category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedCategory(
                    selectedCategory === item.event_category ? '' : item.event_category
                  )}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{getEventIcon(item.event_category)}</span>
                    <span style={{ 
                      fontWeight: selectedCategory === item.event_category ? 'bold' : 'normal',
                      color: selectedCategory === item.event_category ? 'var(--primary-color)' : 'var(--text-primary)'
                    }}>
                      {item.event_category}
                    </span>
                  </div>
                  <div style={{ 
                    backgroundColor: 'var(--bg-light)', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {formatNumber(item.count)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Events */}
        {dashboardData?.topEvents && (
          <div className="form">
            <h2 className="form-title">Most Frequent Events</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {dashboardData.topEvents.map((item, index) => (
                <div 
                  key={item.event_name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: index < 3 ? 'var(--cta-color)' : 'var(--bg-light)',
                      color: index < 3 ? 'var(--primary-color)' : 'var(--text-secondary)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </span>
                    <span>{item.event_name.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ 
                    backgroundColor: 'var(--bg-light)', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {formatNumber(item.count)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Analytics */}
        {dashboardData?.searchAnalytics && dashboardData.searchAnalytics.length > 0 && (
          <div className="form">
            <h2 className="form-title">🔍 Popular Searches</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {dashboardData.searchAnalytics.map((item, index) => (
                <div 
                  key={item.search_query}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <div style={{ 
                    backgroundColor: 'var(--bg-light)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    "{item.search_query}"
                  </div>
                  <div style={{ 
                    backgroundColor: 'var(--secondary-color)', 
                    color: 'white',
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Events */}
        {dashboardData?.errorEvents && dashboardData.errorEvents.length > 0 && (
          <div className="form">
            <h2 className="form-title" style={{ color: 'var(--status-overdue)' }}>❌ Error Events</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {dashboardData.errorEvents.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderRadius: '4px',
                    border: '1px solid rgba(231, 76, 60, 0.2)'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: 'var(--status-overdue)' }}>
                    {item.event_name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {item.error_message}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Count: {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Over Time */}
        {dashboardData?.eventsOverTime && (
          <div className="form">
            <h2 className="form-title">📈 Events Over Time</h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {dashboardData.eventsOverTime.map(item => (
                <div 
                  key={item.date}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  <div style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.9rem'
                  }}>
                    {formatNumber(item.count)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div className="form" style={{ marginTop: '32px' }}>
        <div className="form-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent Events {selectedCategory && `(${selectedCategory})`}</span>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory('')}
              className="btn btn-outline btn-small"
            >
              Clear Filter
            </button>
          )}
        </div>

        {events.length > 0 ? (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Category</th>
                  <th>Event</th>
                  <th>Page</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                      {formatDate(event.timestamp)}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {getEventIcon(event.event_category)}
                        {event.event_category}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {event.event_name}
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {event.page_url ? new URL(event.page_url).pathname : '-'}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.payload ? (
                        <details style={{ cursor: 'pointer' }}>
                          <summary style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            View payload
                          </summary>
                          <pre style={{ 
                            fontSize: '0.8rem', 
                            backgroundColor: 'var(--bg-light)', 
                            padding: '8px', 
                            borderRadius: '4px',
                            marginTop: '4px',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </details>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No events found for the selected time range and filters.</p>
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="form" style={{ marginTop: '32px' }}>
        <h2 className="form-title">ℹ️ Dashboard Info</h2>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p>• Data refreshes automatically every 30 seconds</p>
          <p>• Events are collected anonymously and stored locally</p>
          <p>• Use time range filter to adjust the data window</p>
          <p>• Click on categories to filter events</p>
          <p>• All timestamps are in your local timezone</p>
        </div>
      </div>
    </div>
  );
};

export default TelemetryDashboard;
