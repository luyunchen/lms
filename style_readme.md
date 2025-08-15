# Library Management System – CSS Style Guide

This style guide defines the **color palette**, **UI principles**, and **UX patterns** based on key user personas:
- Librarian / Library Staff
- Library Administrator / Manager
- Library Member / Patron
- IT / System Administrator

The goal is to provide a cohesive, accessible, and efficient interface for all user types.

---

## 🎨 Color Palette

| Role/Usage                  | Color Name    | Hex       | Notes |
|-----------------------------|--------------|-----------|-------|
| **Primary** (trust, structure) | Deep Navy    | `#1F3B4D` | Used for headers, navigation backgrounds, and primary buttons. |
| **Secondary** (success, confirmation) | Teal Green  | `#2A7F6F` | Used for success messages, active states, and accents. |
| **CTA Highlight** (actions) | Golden Yellow | `#F2A541` | Used for Reserve/Renew buttons and attention-grabbing elements. |
| **Background** (neutral)    | Warm Light Gray | `#F9F9F7` | Base background for pages, modals, and cards. |
| **Text Primary**            | Dark Gray     | `#333333` | Main text color for readability. |
| **Text Secondary**          | Medium Gray   | `#666666` | Subtext, hints, and less prominent labels. |

---

## 📐 Layout & Spacing

- **Base font size:** 16px (responsive scaling allowed)
- **Line height:** 1.5 for readability
- **Spacing scale:** Use multiples of `4px` (`4px, 8px, 12px, 16px, 24px, 32px`)
- **Container widths:** Max `1200px` for large screens, full width on mobile

---

## 🖥 UX Guidelines per Persona

### Librarian / Library Staff
- **Dashboard:** Persistent left navigation with main functions (Check-in, Check-out, Catalog, Members)
- **Batch Actions:** Support multi-select & bulk processing
- **Keyboard Shortcuts:** Allow quick navigation (e.g., `Ctrl+F` for book search)
- **Status Indicators:** Color-coded (due soon, overdue, reserved)

### Library Administrator / Manager
- **Reporting:** Clear table layouts and export buttons
- **Role Management:** Accessible from settings without deep menu nesting
- **Analytics:** Use simple charts with minimal clutter

### Library Member / Patron
- **Search-first Layout:** Prominent search bar at top
- **Clear CTAs:** Large Reserve/Borrow buttons in contrasting CTA color
- **Responsive Design:** Mobile-friendly, touch-target size ≥ 44px
- **Notifications:** Visual badges for holds/due dates

### IT / System Admin
- **Minimal Visual Noise:** Prioritize status and logs
- **High Contrast:** For error and success states
- **Utility Panels:** Use monospace font for logs (`font-family: monospace;`)

---

## ♿ Accessibility
- Ensure **contrast ratio ≥ 4.5:1** for all text
- Provide **focus outlines** for keyboard navigation
- Use semantic HTML for screen readers
- Avoid color-only indicators—always pair with icons or labels

---

## 🧩 Reusable Classes (Suggested)
```css
/* Buttons */
.btn-primary {
  background-color: #1F3B4D;
  color: #fff;
  border-radius: 4px;
  padding: 8px 16px;
}

.btn-secondary {
  background-color: #2A7F6F;
  color: #fff;
}

.btn-cta {
  background-color: #F2A541;
  color: #1F3B4D;
}

/* Text */
.text-primary { color: #333333; }
.text-secondary { color: #666666; }

/* Backgrounds */
.bg-primary { background-color: #1F3B4D; }
.bg-secondary { background-color: #2A7F6F; }
.bg-light { background-color: #F9F9F7; }
