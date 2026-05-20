# Todo App Frontend Guide

A modern, responsive frontend for the Todo application built with vanilla HTML, CSS, and JavaScript.

## Quick Start

### 1. Start the Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python3 app.py
```

### 2. Serve the Frontend

**Option A: Python HTTP Server**
```bash
cd frontend
python3 -m http.server 8080
```

**Option B: Open Directly**
Simply open `index.html` in your browser (may have CORS issues)

### 3. Access the App
Open your browser to: `http://localhost:8080`

## Features

✨ Clean, modern UI design  
📱 Fully responsive (mobile, tablet, desktop)  
🎨 Beautiful gradient theme  
⚡ Real-time updates  
🔄 Loading indicators  
⚠️ Error handling with user-friendly messages  
✅ Success notifications  
🎯 Filter todos (All, Active, Completed)  
📊 Statistics display  

## Configuration

If your backend runs on a different port, update `app.js`:

```javascript
const API_BASE_URL = 'http://localhost:YOUR_PORT/api';
```

## Learning from the Code

The `app.js` file includes extensive comments explaining:

- **API Calls**: How fetch() works with async/await
- **Error Handling**: try/catch blocks and user feedback
- **State Management**: Organizing application data
- **DOM Manipulation**: Creating and updating HTML
- **Event Handling**: Responding to user actions
- **Security**: Preventing XSS attacks

Perfect for beginners learning modern JavaScript!

## Keyboard Shortcuts

- **Enter** - Submit new todo
- **Tab** - Navigate between elements
- **Space** - Toggle checkboxes/buttons

## Troubleshooting

**"Failed to load todos" error:**
- Verify backend is running on port 5004
- Check API_BASE_URL in app.js
- Look for CORS errors in browser console

**Todos not appearing:**
- Open DevTools (F12) and check Console tab
- Check Network tab for failed API calls

## Browser Support

✅ Chrome/Edge  
✅ Firefox  
✅ Safari  
❌ IE11 (uses modern JavaScript)