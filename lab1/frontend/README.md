
# Todo App Frontend

A modern, responsive frontend for the Todo application built with vanilla HTML, CSS, and JavaScript.

## Features

- ✨ Clean, modern UI design
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Beautiful gradient theme
- ⚡ Real-time updates
- 🔄 Loading indicators
- ⚠️ Error handling with user-friendly messages
- ✅ Success notifications
- 🎯 Filter todos (All, Active, Completed)
- 📊 Statistics display

## Files

- **index.html** - Main HTML structure with semantic markup
- **styles.css** - Responsive CSS with modern design patterns
- **app.js** - JavaScript with extensive literate coding comments

## How to Run

### Option 1: Using Python's Built-in Server

```bash
cd frontend
python3 -m http.server 8080
```

Then open your browser to: `http://localhost:8080`

### Option 2: Using Node.js http-server

```bash
# Install http-server globally (one time)
npm install -g http-server

# Run the server
cd frontend
http-server -p 8080
```

### Option 3: Using VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Direct File Access

Simply open `index.html` directly in your browser. However, note that some browsers may block API calls due to CORS restrictions when using the `file://` protocol.

## Prerequisites

Make sure the backend API is running before using the frontend:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python3 app.py
```

The backend should be running on `http://localhost:5004/api`

## Configuration

If your backend is running on a different port, update the `API_BASE_URL` in `app.js`:

```javascript
const API_BASE_URL = 'http://localhost:YOUR_PORT/api';
```

## Learning Resources

The `app.js` file includes extensive literate coding comments that explain:

- **How API calls work** - Understanding fetch(), async/await, and HTTP methods
- **Why we use async/await** - Benefits over callbacks and Promises
- **Error handling** - try/catch blocks and user feedback
- **State management** - Keeping application state organized
- **DOM manipulation** - Creating and updating HTML elements
- **Event handling** - Responding to user interactions
- **Security** - Preventing XSS attacks with proper escaping

Perfect for beginners learning modern JavaScript!

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (uses modern JavaScript features)

## Keyboard Shortcuts

- **Enter** - Submit new todo (when input is focused)
- **Tab** - Navigate between elements
- **Space** - Toggle checkboxes and buttons

## Accessibility

- Semantic HTML for screen readers
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators for keyboard users
- Reduced motion support for users who prefer it

## Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: ≤ 480px

## API Endpoints Used

- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create new todo
- `PATCH /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## Troubleshooting

### "Failed to load todos" error

- Check that the backend is running
- Verify the API_BASE_URL in app.js matches your backend port
- Check browser console for CORS errors

### Todos not appearing

- Open browser DevTools (F12)
- Check the Console tab for errors
- Check the Network tab to see if API calls are successful

### Styling issues

- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check that styles.css is in the same directory as index.html

## Future Enhancements

Potential improvements for learning:

- Add todo editing functionality
- Implement drag-and-drop reordering
- Add due dates and priorities
- Implement local storage for offline support
- Add animations and transitions
- Implement search/filter functionality
- Add dark mode toggle
