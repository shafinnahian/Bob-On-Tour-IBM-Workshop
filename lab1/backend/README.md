# Todo App - Flask Backend

A RESTful API backend for a todo application built with Flask and SQLAlchemy.

## Features

- ✅ Full CRUD operations for todos
- ✅ SQLite database with SQLAlchemy ORM
- ✅ CORS enabled for frontend integration
- ✅ Input validation and error handling
- ✅ RESTful API design with proper HTTP status codes

## Project Structure

```
backend/
├── app.py              # Main Flask application with API routes
├── models.py           # SQLAlchemy Todo model
├── database.py         # Database initialization
├── requirements.txt    # Python dependencies
└── todos.db           # SQLite database (auto-generated)
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **The API will be available at:**
   ```
   http://localhost:5000/api
   ```

3. **Health check endpoint:**
   ```
   http://localhost:5000/api/health
   ```

## API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/todos` | Get all todos | None | Array of todos |
| GET | `/todos/<id>` | Get single todo | None | Todo object |
| POST | `/todos` | Create new todo | `{title, description?}` | Created todo |
| PUT | `/todos/<id>` | Update todo | `{title?, description?, completed?}` | Updated todo |
| DELETE | `/todos/<id>` | Delete todo | None | Success message |
| GET | `/health` | Health check | None | Status message |

### Request/Response Examples

#### Create Todo (POST /api/todos)

**Request:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-05-20T10:00:00.000000"
}
```

#### Get All Todos (GET /api/todos)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-05-20T10:00:00.000000"
  },
  {
    "id": 2,
    "title": "Finish project",
    "description": null,
    "completed": true,
    "created_at": "2026-05-20T09:00:00.000000"
  }
]
```

#### Update Todo (PUT /api/todos/1)

**Request:**
```json
{
  "completed": true
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-05-20T10:00:00.000000"
}
```

#### Delete Todo (DELETE /api/todos/1)

**Response (200 OK):**
```json
{
  "message": "Todo deleted successfully",
  "status": 200
}
```

### Error Responses

All errors follow this format:

```json
{
  "error": "Error message description",
  "status": 404
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

### Todo Model

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| title | STRING(200) | NOT NULL | Todo title |
| description | TEXT | NULLABLE | Optional description |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | Creation timestamp |

## Testing the API

### Using curl

**Create a todo:**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Todo","description":"Testing the API"}'
```

**Get all todos:**
```bash
curl http://localhost:5000/api/todos
```

**Update a todo:**
```bash
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**Delete a todo:**
```bash
curl -X DELETE http://localhost:5000/api/todos/1
```

### Using Python requests

```python
import requests

# Create todo
response = requests.post('http://localhost:5000/api/todos', 
    json={'title': 'Test Todo', 'description': 'Testing'})
print(response.json())

# Get all todos
response = requests.get('http://localhost:5000/api/todos')
print(response.json())

# Update todo
response = requests.put('http://localhost:5000/api/todos/1',
    json={'completed': True})
print(response.json())

# Delete todo
response = requests.delete('http://localhost:5000/api/todos/1')
print(response.json())
```

## Development

### Debug Mode

The application runs in debug mode by default, which provides:
- Auto-reload on code changes
- Detailed error messages
- Interactive debugger

To disable debug mode for production, modify `app.py`:
```python
app.run(debug=False, host='0.0.0.0', port=5000)
```

### Database Management

The SQLite database (`todos.db`) is automatically created when you first run the application.

To reset the database:
1. Stop the server
2. Delete `todos.db`
3. Restart the server (database will be recreated)

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, change the port in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Import Errors

Make sure you've activated the virtual environment and installed all dependencies:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### CORS Issues

CORS is enabled for all origins by default. To restrict origins, modify `app.py`:
```python
CORS(app, origins=['http://localhost:8000'])
```

