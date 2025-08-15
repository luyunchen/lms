import api from './api';

class TelemetryService {
  constructor() {
    this.sessionId = null;
    this.isEnabled = true;
    this.eventQueue = [];
    this.sessionData = [];
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    this.startTime = Date.now();
    this.storageKey = 'library_telemetry_data';
    
    this.initSession();
    this.setupEventListeners();
    this.startBatchFlush();
    this.loadStoredData();
  }

  loadStoredData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.sessionData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load stored telemetry data:', error);
      this.sessionData = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.sessionData));
    } catch (error) {
      console.error('Failed to save telemetry data to storage:', error);
    }
  }

  async initSession() {
    try {
      // Generate session ID locally
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Try to create session in backend (optional)
      try {
        await api.post('/api/telemetry/session', {
          sessionId: this.sessionId,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        });
      } catch (apiError) {
        console.log('Backend telemetry unavailable, using offline mode');
      }
        
      // Track session start locally
      this.track('navigation', 'session', 'session_start', {
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    } catch (error) {
      console.error('Failed to initialize telemetry session:', error);
    }
  }

  setupEventListeners() {
    // Page view tracking
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // Performance tracking
    window.addEventListener('load', () => {
      this.trackPerformance();
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('unhandled_promise_rejection', event.reason);
    });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const element = event.target;
      
      // Track button clicks
      if (element.tagName === 'BUTTON' || element.classList.contains('btn')) {
        this.track('interaction', 'click', 'button_click', {
          buttonText: element.textContent.trim(),
          buttonClass: element.className,
          page: window.location.pathname
        });
      }

      // Track link clicks
      if (element.tagName === 'A') {
        this.track('interaction', 'click', 'link_click', {
          linkText: element.textContent.trim(),
          linkHref: element.href,
          isExternal: element.hostname !== window.location.hostname
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        this.track('interaction', 'form', 'form_submit', {
          formId: form.id,
          formClass: form.className,
          page: window.location.pathname
        });
      }
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('navigation', 'visibility', 'page_hidden');
      } else {
        this.track('navigation', 'visibility', 'page_visible');
      }
    });

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      this.track('navigation', 'session', 'session_end', {
        duration: Date.now() - this.startTime
      });
      this.cleanup(); // Export CSV and cleanup
    });
  }

  track(category, type, eventName, payload = {}, duration = null) {
    if (!this.isEnabled || !this.sessionId) return;

    const event = {
      sessionId: this.sessionId,
      eventType: type,
      eventCategory: category,
      eventName: eventName,
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
      payload: payload,
      duration: duration,
      timestamp: new Date().toISOString()
    };

    // Store locally
    this.sessionData.push(event);
    this.saveToStorage();

    // Also add to queue for backend sync (if available)
    this.eventQueue.push(event);

    // Flush immediately for critical events
    if (category === 'error' || eventName === 'session_end') {
      this.flush(true);
    } else if (this.eventQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  trackError(errorType, error, additionalData = {}) {
    this.track('error', 'exception', errorType, {
      message: error.message || error.toString(),
      stack: error.stack,
      ...additionalData
    });
  }

  trackPerformance() {
    if (!window.performance) return;

    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.trackMetric('performance', 'page_load_time', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
      this.trackMetric('performance', 'dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
      this.trackMetric('performance', 'first_byte', navigation.responseStart - navigation.requestStart, 'ms');
    }

    // Track largest contentful paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackMetric('performance', 'largest_contentful_paint', entry.startTime, 'ms');
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  trackMetric(type, name, value, unit, additionalData = {}) {
    if (!this.sessionId) return;

    api.post('/api/telemetry/performance', {
      sessionId: this.sessionId,
      metricType: type,
      metricName: name,
      value: value,
      unit: unit,
      additionalData: additionalData
    }).catch(error => {
      console.error('Failed to track metric:', error);
    });
  }

  trackPageView(customData = {}) {
    this.track('navigation', 'page_view', 'page_view', {
      url: window.location.href,
      pathname: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
      ...customData
    });
  }

  trackSearch(query, resultsCount, suggestions = [], selectedSuggestion = null) {
    this.track('search', 'search', 'search_query', {
      query: query,
      resultsCount: resultsCount,
      suggestionsCount: suggestions.length,
      selectedSuggestion: selectedSuggestion,
      queryLength: query.length
    });
  }

  trackBookAction(action, bookId, bookTitle, additionalData = {}) {
    this.track('book', 'action', action, {
      bookId: bookId,
      bookTitle: bookTitle,
      ...additionalData
    });
  }

  trackFeatureUsage(feature, action, data = {}) {
    this.track('feature', 'usage', `${feature}_${action}`, data);
  }

  async flush(force = false) {
    if (this.eventQueue.length === 0) return;
    if (!force && this.eventQueue.length < this.batchSize) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Try to send to backend (optional)
      for (const event of events) {
        try {
          await api.post('/api/telemetry/event', event);
        } catch (apiError) {
          // Ignore API errors, data is already stored locally
          console.log('Backend sync failed, continuing with offline mode');
        }
      }
    } catch (error) {
      console.error('Failed to flush telemetry events:', error);
    }
  }

  // CSV Export functionality
  exportToCSV(filename = null) {
    if (this.sessionData.length === 0) {
      console.log('No telemetry data to export');
      return;
    }

    const csvData = this.convertToCSV(this.sessionData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `telemetry_${this.sessionId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertToCSV(data) {
    if (data.length === 0) return '';

    // Get all unique keys from the data
    const headers = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'payload') {
          headers.add(key);
        }
        // Flatten payload if it exists
        if (key === 'payload' && row[key]) {
          Object.keys(row[key]).forEach(payloadKey => {
            headers.add(`payload_${payloadKey}`);
          });
        }
      });
    });

    const headerArray = Array.from(headers);
    
    // Create CSV content
    let csv = headerArray.join(',') + '\n';
    
    data.forEach(row => {
      const csvRow = headerArray.map(header => {
        if (header.startsWith('payload_')) {
          const payloadKey = header.replace('payload_', '');
          const value = row.payload && row.payload[payloadKey] !== undefined 
            ? row.payload[payloadKey] 
            : '';
          return `"${String(value).replace(/"/g, '""')}"`;
        } else {
          const value = row[header] !== undefined ? row[header] : '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }
      });
      csv += csvRow.join(',') + '\n';
    });

    return csv;
  }

  // Get summary statistics
  getSessionSummary() {
    const totalEvents = this.sessionData.length;
    const eventsByCategory = {};
    const eventsByType = {};
    const timeRange = {
      start: null,
      end: null,
      duration: 0
    };

    this.sessionData.forEach(event => {
      // Count by category
      eventsByCategory[event.eventCategory] = (eventsByCategory[event.eventCategory] || 0) + 1;
      
      // Count by type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      
      // Track time range
      const eventTime = new Date(event.timestamp);
      if (!timeRange.start || eventTime < timeRange.start) {
        timeRange.start = eventTime;
      }
      if (!timeRange.end || eventTime > timeRange.end) {
        timeRange.end = eventTime;
      }
    });

    if (timeRange.start && timeRange.end) {
      timeRange.duration = timeRange.end - timeRange.start;
    }

    return {
      totalEvents,
      eventsByCategory,
      eventsByType,
      timeRange,
      sessionId: this.sessionId
    };
  }

  // Clear stored data
  clearStoredData() {
    this.sessionData = [];
    localStorage.removeItem(this.storageKey);
  }

  startBatchFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // Public API methods
  disable() {
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
  }

  isEnabled() {
    return this.isEnabled;
  }

  // Cleanup method - exports CSV and clears data
  cleanup() {
    this.flush(true); // Final flush
    
    // Auto-export CSV if we have data
    if (this.sessionData.length > 0) {
      console.log('Exporting telemetry data as CSV...');
      this.exportToCSV();
      
      // Show session summary
      const summary = this.getSessionSummary();
      console.log('Session Summary:', summary);
    }
  }

  // Initialize method for setup
  init() {
    // Already initialized in constructor, but can be called explicitly
    console.log('Telemetry service initialized with offline CSV export');
    return this;
  }
}

// Create global telemetry instance
const telemetryService = new TelemetryService();

// Export for use in components
export { telemetryService };
export default telemetryService;
