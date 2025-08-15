import api from './api';

class TelemetryService {
  constructor() {
    this.sessionId = null;
    this.isEnabled = true;
    this.eventQueue = [];
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    this.startTime = Date.now();
    
    this.initSession();
    this.setupEventListeners();
    this.startBatchFlush();
  }

  async initSession() {
    try {
      const response = await api.post('/api/telemetry/session', {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      });

      if (response.data) {
        this.sessionId = response.data.sessionId;
        
        // Track session start
        this.track('navigation', 'session', 'session_start', {
          url: window.location.href,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        });
      }
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
      this.flush(true); // Force flush before leaving
      this.track('navigation', 'session', 'session_end', {
        duration: Date.now() - this.startTime
      });
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
      for (const event of events) {
        await api.post('/api/telemetry/event', event);
      }
    } catch (error) {
      console.error('Failed to flush telemetry events:', error);
      // Put events back in queue for retry
      this.eventQueue.unshift(...events);
    }
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
}

// Create global telemetry instance
const telemetry = new TelemetryService();

// Export for use in components
export default telemetry;
