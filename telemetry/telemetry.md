# 📊 Library Management System – Telemetry & Data Collection

This module defines strategies for **collecting telemetry and user interaction data** to understand usage patterns, identify friction points, and guide future iterations of the LMS.

---

## 🎯 Goals
- Track feature usage across different personas (Patrons, Librarians, Admins, IT)
- Identify bottlenecks and pain points in workflows
- Collect anonymized interaction data for analytics
- Measure search performance, session duration, and popular content
- Enable data-driven product improvements and A/B testing

---

## 📂 Directory Structure
/telemetry
├── telemetry_client.js # Frontend JS for sending telemetry events
├── telemetry_server.py # Backend endpoint to receive and store events
├── telemetry_schema.json # Event schema and fields
├── README.md # This file
└── utils.py # Helper functions for sanitization and batching

pgsql
Copy
Edit

---

## ⚙️ Telemetry Data Types

| Category                   | Description | Examples |
|-----------------------------|-------------|---------|
| **User Actions**           | Track what users are doing | Book search, borrow, renew, check-in/out, reservation |
| **Navigation Events**      | Track how users move through UI | Page views, tab switches, menu clicks |
| **Search Analytics**       | Track queries and results | Query term, results count, clicks on suggestions |
| **System Performance**     | Measure latency & errors | API response time, failed requests, load times |
| **Feature Engagement**     | Identify which features are used most | Bulk check-out, autocomplete, reporting dashboard |
| **Errors & Exceptions**    | Capture frontend/backend errors | JS console errors, backend stack traces (anonymized) |

---

## 🖥 Implementation

### Frontend Telemetry (`telemetry_client.js`)
```javascript
// Send event to backend endpoint
function sendTelemetry(eventName, payload) {
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      payload: payload
    })
  });
}

// Example usage
document.getElementById('search-box').addEventListener('input', (e) => {
  sendTelemetry('search_input', { query: e.target.value });
});