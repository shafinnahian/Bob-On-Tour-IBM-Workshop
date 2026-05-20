from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db, init_db
from models import Todo

# Initialize Flask application
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

# Enable CORS for all routes
CORS(app)

# Initialize database
init_db(app)


# Error handler for 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found', 'status': 404}), 404


# Error handler for 500
@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error', 'status': 500}), 500


# API Routes

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """
    Get all todos.
    
    Returns:
        JSON array of all todos
    """
    try:
        todos = Todo.query.order_by(Todo.created_at.desc()).all()
        return jsonify([todo.to_dict() for todo in todos]), 200
    except Exception as e:
        return jsonify({'error': str(e), 'status': 500}), 500


@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """
    Get a single todo by ID.
    
    Args:
        todo_id: ID of the todo to retrieve
        
    Returns:
        JSON object of the todo
    """
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({'error': 'Todo not found', 'status': 404}), 404
        return jsonify(todo.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e), 'status': 500}), 500


@app.route('/api/todos', methods=['POST'])
def create_todo():
    """
    Create a new todo.
    
    Expected JSON body:
        {
            "title": "string (required)",
            "description": "string (optional)"
        }
        
    Returns:
        JSON object of the created todo
    """
    try:
        data = request.get_json(silent=True)
        
        if data is None or not data:
            return jsonify({'error': 'No data provided', 'status': 400}), 400
        
        # Validate data
        is_valid, error_message = Todo.validate_todo_data(data)
        if not is_valid:
            return jsonify({'error': error_message, 'status': 400}), 400
        
        # Create new todo
        new_todo = Todo(
            title=data['title'].strip(),
            description=data.get('description', '').strip() if data.get('description') else None,
            completed=False
        )
        
        db.session.add(new_todo)
        db.session.commit()
        
        return jsonify(new_todo.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e), 'status': 500}), 500


@app.route('/api/todos/<int:todo_id>', methods=['PUT', 'PATCH'])
def update_todo(todo_id):
    """
    Update an existing todo.
    
    Args:
        todo_id: ID of the todo to update
        
    Expected JSON body (all fields optional):
        {
            "title": "string",
            "description": "string",
            "completed": boolean
        }
        
    Returns:
        JSON object of the updated todo
    """
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({'error': 'Todo not found', 'status': 404}), 404
        
        data = request.get_json(silent=True)
        
        if data is None or not data:
            return jsonify({'error': 'No data provided', 'status': 400}), 400
        
        # Validate data
        is_valid, error_message = Todo.validate_todo_data(data, is_update=True)
        if not is_valid:
            return jsonify({'error': error_message, 'status': 400}), 400
        
        # Update fields if provided
        if 'title' in data and data['title']:
            todo.title = data['title'].strip()
        
        if 'description' in data:
            todo.description = data['description'].strip() if data['description'] else None
        
        if 'completed' in data:
            todo.completed = data['completed']
        
        db.session.commit()
        
        return jsonify(todo.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e), 'status': 500}), 500


@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """
    Delete a todo.
    
    Args:
        todo_id: ID of the todo to delete
        
    Returns:
        JSON confirmation message
    """
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({'error': 'Todo not found', 'status': 404}), 404
        
        db.session.delete(todo)
        db.session.commit()
        
        return jsonify({'message': 'Todo deleted successfully', 'status': 200}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e), 'status': 500}), 500


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        JSON status message
    """
    return jsonify({'status': 'healthy', 'message': 'Todo API is running'}), 200


def find_available_port(start_port=5000, max_attempts=10):
    """
    Find an available port starting from start_port.
    
    Args:
        start_port: Port to start searching from
        max_attempts: Maximum number of ports to try
        
    Returns:
        int: Available port number
    """
    import socket
    
    for port in range(start_port, start_port + max_attempts):
        try:
            # Try to bind to the port
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('0.0.0.0', port))
                return port
        except OSError:
            # Port is in use, try next one
            continue
    
    # If no port found, raise an error
    raise RuntimeError(f"Could not find an available port in range {start_port}-{start_port + max_attempts - 1}")


if __name__ == '__main__':
    # Find an available port
    try:
        port = find_available_port(start_port=5000)
        print("Starting Flask Todo API server...")
        print(f"API available at: http://localhost:{port}/api")
        print(f"Health check: http://localhost:{port}/api/health")
        app.run(debug=True, host='0.0.0.0', port=port)
    except RuntimeError as e:
        print(f"Error: {e}")
        print("Please free up some ports or specify a different port range.")
