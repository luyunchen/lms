import React, { useState, useEffect } from 'react';
import { telemetryService } from '../services/telemetry';

const TelemetryManager = () => {
  const [summary, setSummary] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Update summary periodically
    const updateSummary = () => {
      setSummary(telemetryService.getSessionSummary());
    };

    updateSummary();
    const interval = setInterval(updateSummary, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    telemetryService.exportToCSV();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all telemetry data? This cannot be undone.')) {
      telemetryService.clearStoredData();
      setSummary(telemetryService.getSessionSummary());
    }
  };

  const handleToggleTracking = () => {
    if (isEnabled) {
      telemetryService.disable();
    } else {
      telemetryService.enable();
    }
    setIsEnabled(!isEnabled);
  };

  if (!summary) {
    return <div>Loading telemetry data...</div>;
  }

  return (
    <div className="form" style={{ marginTop: '32px' }}>
      <h2 className="form-title">📊 Session Telemetry Manager</h2>
      
      {/* Session Info */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="stat-card">
            <div className="stat-number">{summary.totalEvents}</div>
            <div className="stat-label">Total Events</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {summary.timeRange.duration ? Math.round(summary.timeRange.duration / 1000 / 60) : 0}
            </div>
            <div className="stat-label">Session Minutes</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{Object.keys(summary.eventsByCategory).length}</div>
            <div className="stat-label">Event Categories</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              <span style={{ 
                color: isEnabled ? 'var(--status-available)' : 'var(--status-overdue)',
                fontSize: '1.2rem'
              }}>
                {isEnabled ? '●' : '○'}
              </span>
            </div>
            <div className="stat-label">Tracking Status</div>
          </div>
        </div>
      </div>

      {/* Event Categories Breakdown */}
      {summary.totalEvents > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Event Categories</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {Object.entries(summary.eventsByCategory).map(([category, count]) => (
              <div 
                key={category}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-light)',
                  borderRadius: '4px'
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{category}</span>
                <span style={{ 
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Details */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Session Details</h3>
        <div style={{ 
          backgroundColor: 'var(--bg-light)', 
          padding: '16px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          <div><strong>Session ID:</strong> {summary.sessionId}</div>
          {summary.timeRange.start && (
            <>
              <div><strong>Started:</strong> {summary.timeRange.start.toLocaleString()}</div>
              {summary.timeRange.end && (
                <div><strong>Last Activity:</strong> {summary.timeRange.end.toLocaleString()}</div>
              )}
            </>
          )}
          <div><strong>Storage:</strong> localStorage (offline-first)</div>
          <div><strong>Export Format:</strong> CSV</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="btn-group" style={{ flexWrap: 'wrap' }}>
        <button 
          onClick={handleExportCSV}
          className="btn btn-primary"
          disabled={summary.totalEvents === 0}
        >
          📥 Export CSV ({summary.totalEvents} events)
        </button>
        
        <button 
          onClick={handleToggleTracking}
          className={`btn ${isEnabled ? 'btn-outline' : 'btn-primary'}`}
        >
          {isEnabled ? '⏸️ Pause Tracking' : '▶️ Resume Tracking'}
        </button>
        
        <button 
          onClick={handleClearData}
          className="btn btn-outline"
          style={{ color: 'var(--status-overdue)', borderColor: 'var(--status-overdue)' }}
          disabled={summary.totalEvents === 0}
        >
          🗑️ Clear Data
        </button>
      </div>

      {/* Info Text */}
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: 'rgba(42, 127, 111, 0.1)',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <p style={{ margin: 0 }}>
          📊 <strong>Offline Telemetry:</strong> All data is stored locally in your browser. 
          CSV exports are automatically generated at session end. No data is sent to external servers 
          unless backend sync is available.
        </p>
      </div>
    </div>
  );
};

export default TelemetryManager;
