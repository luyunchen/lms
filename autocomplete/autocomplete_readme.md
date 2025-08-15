# 📚 Library Management System – Quick Fuzzy Search & Autocomplete

This module implements a **fast, typo-tolerant, and suggestion-based search** for the LMS catalog using **Elasticsearch** (or OpenSearch) with fuzzy matching and completion suggestions.

---

## 🎯 Features
- **Fuzzy Search:** Handles typos and partial matches (`"Hary Poter"` → `"Harry Potter"`).
- **Autocomplete:** Suggests book titles, authors, and genres as you type.
- **Multi-Field Boosting:** Title matches are ranked higher than author/description matches.
- **Debounced Frontend Queries:** Reduces server load by delaying requests until the user stops typing.
- **Lightweight NLP Preprocessing:** Tokenization, lowercasing, and stemming for better matches.

---

## 🛠 Tech Stack
- **Backend:** Python FastAPI (API layer)
- **Search Engine:** Elasticsearch / OpenSearch
- **Frontend:** Any JS framework (React/Vue/Vanilla)
- **NLP:** Elasticsearch analyzers + optional `fuzzy` query

---

## 📂 Directory Structure
/search
├── index_setup.py # Creates & configures Elasticsearch index with analyzers
├── search_api.py # FastAPI endpoints for search & autocomplete
├── requirements.txt # Python dependencies
├── README.md # This file
└── sample_data.json # Example book records for indexing

yaml
Copy
Edit

---

## ⚙️ Index Setup

Run `index_setup.py` to create the `library_books` index with the following settings:

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "stemmer"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "author": { "type": "text" },
      "description": { "type": "text" },
      "title_suggest": {
        "type": "completion"
      }
    }
  }
}