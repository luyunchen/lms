import React, { useEffect } from 'react';
import { telemetryService } from '../services/telemetry';

const TelemetryTest = () => {
  useEffect(() => {
    // Test various telemetry functions
    telemetryService.trackEvent('test_event', { test: 'data' });
    telemetryService.trackPageView({ page: 'test' });
    telemetryService.trackFeatureUsage('analytics', 'test');
    
    console.log('Telemetry test completed');
    console.log('Session summary:', telemetryService.getSessionSummary());
  }, []);

  const handleExportTest = () => {
    telemetryService.exportToCSV('test_export.csv');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Telemetry Test Component</h2>
      <button onClick={handleExportTest}>Test CSV Export</button>
      <p>Check console for telemetry data</p>
    </div>
  );
};

export default TelemetryTest;
