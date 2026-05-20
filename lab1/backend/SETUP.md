# Todo App Backend - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python app.py
```

Server will start at: `http://localhost:5000/api`

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/<id>` - Get single todo
- `POST /api/todos` - Create todo (body: `{title, description?}`)
- `PUT /api/todos/<id>` - Update todo (body: `{title?, description?, completed?}`)
- `DELETE /api/todos/<id>` - Delete todo
- `GET /api/health` - Health check

## Test with curl

```bash
# Create todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Todo","description":"Testing"}'

# Get all todos
curl http://localhost:5000/api/todos

# Update todo
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete todo
curl -X DELETE http://localhost:5000/api/todos/1
```

## Files

- `app.py` - Main Flask application with API routes
- `models.py` - Todo database model
- `database.py` - Database initialization
- `requirements.txt` - Python dependencies
- `todos.db` - SQLite database (auto-generated)