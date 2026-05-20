import pytest
import json
import os
import tempfile
from app import app, db
from models import Todo


@pytest.fixture
def client():
    """
    Create a test client with a temporary database.
    """
    # Create a temporary file for the test database
    db_fd, db_path = tempfile.mkstemp()
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['TESTING'] = True
    
    with app.app_context():
        db.drop_all()  # Ensure clean state
        db.create_all()
        
    with app.test_client() as client:
        yield client
    
    # Cleanup
    with app.app_context():
        db.session.remove()
        db.drop_all()
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def sample_todo(client):
    """
    Create a sample todo for testing.
    """
    response = client.post('/api/todos',
                          data=json.dumps({'title': 'Test Todo', 'description': 'Test Description'}),
                          content_type='application/json')
    return json.loads(response.data)


class TestHealthEndpoint:
    """Test cases for health check endpoint."""
    
    def test_health_check(self, client):
        """Test health check endpoint returns correct status."""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert data['message'] == 'Todo API is running'


class TestGetTodos:
    """Test cases for GET /api/todos endpoint."""
    
    def test_get_empty_todos(self, client):
        """Test getting todos when database is empty."""
        response = client.get('/api/todos')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == []
    
    def test_get_todos_with_data(self, client):
        """Test getting todos when database has data."""
        # Create test todos
        client.post('/api/todos',
                   data=json.dumps({'title': 'Todo 1', 'description': 'Description 1'}),
                   content_type='application/json')
        client.post('/api/todos',
                   data=json.dumps({'title': 'Todo 2', 'description': 'Description 2'}),
                   content_type='application/json')
        
        response = client.get('/api/todos')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 2
        # Check that todos are ordered by created_at desc (newest first)
        assert data[0]['title'] == 'Todo 2'
        assert data[1]['title'] == 'Todo 1'


class TestGetSingleTodo:
    """Test cases for GET /api/todos/<id> endpoint."""
    
    def test_get_existing_todo(self, client, sample_todo):
        """Test getting a single existing todo."""
        todo_id = sample_todo['id']
        response = client.get(f'/api/todos/{todo_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == todo_id
        assert data['title'] == 'Test Todo'
        assert data['description'] == 'Test Description'
        assert data['completed'] == False
    
    def test_get_nonexistent_todo(self, client):
        """Test getting a todo that doesn't exist."""
        response = client.get('/api/todos/9999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Todo not found'


class TestCreateTodo:
    """Test cases for POST /api/todos endpoint."""
    
    def test_create_todo_with_title_only(self, client):
        """Test creating a todo with only title."""
        response = client.post('/api/todos',
                              data=json.dumps({'title': 'New Todo'}),
                              content_type='application/json')
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == 'New Todo'
        assert data['description'] is None
        assert data['completed'] == False
        assert 'id' in data
        assert 'created_at' in data
    
    def test_create_todo_with_title_and_description(self, client):
        """Test creating a todo with title and description."""
        response = client.post('/api/todos',
                              data=json.dumps({
                                  'title': 'New Todo',
                                  'description': 'Detailed description'
                              }),
                              content_type='application/json')
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == 'New Todo'
        assert data['description'] == 'Detailed description'
        assert data['completed'] == False
    
    def test_create_todo_without_title(self, client):
        """Test creating a todo without title (should fail)."""
        response = client.post('/api/todos',
                              data=json.dumps({'description': 'No title'}),
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_todo_with_empty_title(self, client):
        """Test creating a todo with empty title (should fail)."""
        response = client.post('/api/todos',
                              data=json.dumps({'title': '   '}),
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_todo_with_long_title(self, client):
        """Test creating a todo with title exceeding max length."""
        long_title = 'x' * 201  # Exceeds 200 character limit
        response = client.post('/api/todos',
                              data=json.dumps({'title': long_title}),
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_todo_without_data(self, client):
        """Test creating a todo without any data."""
        response = client.post('/api/todos',
                              data='',
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_todo_with_whitespace_trimming(self, client):
        """Test that whitespace is trimmed from title and description."""
        response = client.post('/api/todos',
                              data=json.dumps({
                                  'title': '  Trimmed Title  ',
                                  'description': '  Trimmed Description  '
                              }),
                              content_type='application/json')
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == 'Trimmed Title'
        assert data['description'] == 'Trimmed Description'


class TestUpdateTodo:
    """Test cases for PUT /api/todos/<id> endpoint."""
    
    def test_update_todo_title(self, client, sample_todo):
        """Test updating todo title."""
        todo_id = sample_todo['id']
        response = client.put(f'/api/todos/{todo_id}',
                             data=json.dumps({'title': 'Updated Title'}),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Updated Title'
        assert data['description'] == 'Test Description'  # Unchanged
    
    def test_update_todo_description(self, client, sample_todo):
        """Test updating todo description."""
        todo_id = sample_todo['id']
        response = client.put(f'/api/todos/{todo_id}',
                             data=json.dumps({'description': 'Updated Description'}),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['description'] == 'Updated Description'
        assert data['title'] == 'Test Todo'  # Unchanged
    
    def test_update_todo_completed(self, client, sample_todo):
        """Test updating todo completed status."""
        todo_id = sample_todo['id']
        response = client.put(f'/api/todos/{todo_id}',
                             data=json.dumps({'completed': True}),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['completed'] == True
    
    def test_update_todo_multiple_fields(self, client, sample_todo):
        """Test updating multiple fields at once."""
        todo_id = sample_todo['id']
        response = client.put(f'/api/todos/{todo_id}',
                             data=json.dumps({
                                 'title': 'New Title',
                                 'description': 'New Description',
                                 'completed': True
                             }),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'New Title'
        assert data['description'] == 'New Description'
        assert data['completed'] == True
    
    def test_update_nonexistent_todo(self, client):
        """Test updating a todo that doesn't exist."""
        response = client.put('/api/todos/9999',
                             data=json.dumps({'title': 'Updated'}),
                             content_type='application/json')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_update_todo_without_data(self, client, sample_todo):
        """Test updating a todo without any data."""
        todo_id = sample_todo['id']
        response = client.put(f'/api/todos/{todo_id}',
                             data='',
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_update_todo_with_invalid_completed(self, client, sample_todo):
        """Test updating todo with invalid completed value."""
        todo_id = sample_todo['id']
        response = client.put(f'/api/todos/{todo_id}',
                             data=json.dumps({'completed': 'not_a_boolean'}),
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_update_todo_clear_description(self, client, sample_todo):
        """Test clearing todo description by setting it to empty string."""
        todo_id = sample_todo['id']
        response = client.put(f'/api/todos/{todo_id}',
                             data=json.dumps({'description': ''}),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['description'] is None
    
    def test_update_todo_with_long_title(self, client, sample_todo):
        """Test updating todo with title exceeding max length."""
        todo_id = sample_todo['id']
        long_title = 'x' * 201
        response = client.put(f'/api/todos/{todo_id}',
                             data=json.dumps({'title': long_title}),
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data


class TestDeleteTodo:
    """Test cases for DELETE /api/todos/<id> endpoint."""
    
    def test_delete_existing_todo(self, client, sample_todo):
        """Test deleting an existing todo."""
        todo_id = sample_todo['id']
        response = client.delete(f'/api/todos/{todo_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Todo deleted successfully'
        
        # Verify todo is actually deleted
        get_response = client.get(f'/api/todos/{todo_id}')
        assert get_response.status_code == 404
    
    def test_delete_nonexistent_todo(self, client):
        """Test deleting a todo that doesn't exist."""
        response = client.delete('/api/todos/9999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Todo not found'
    
    def test_delete_todo_twice(self, client, sample_todo):
        """Test deleting the same todo twice."""
        todo_id = sample_todo['id']
        # First deletion should succeed
        response1 = client.delete(f'/api/todos/{todo_id}')
        assert response1.status_code == 200
        
        # Second deletion should fail
        response2 = client.delete(f'/api/todos/{todo_id}')
        assert response2.status_code == 404


class TestErrorHandlers:
    """Test cases for error handlers."""
    
    def test_404_error_handler(self, client):
        """Test 404 error handler for non-existent route."""
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert data['status'] == 404


class TestTodoModel:
    """Test cases for Todo model methods."""
    
    def test_todo_to_dict(self, client, sample_todo):
        """Test Todo model to_dict method."""
        assert 'id' in sample_todo
        assert 'title' in sample_todo
        assert 'description' in sample_todo
        assert 'completed' in sample_todo
        assert 'created_at' in sample_todo
    
    def test_todo_validation_empty_title(self):
        """Test Todo validation with empty title."""
        is_valid, error = Todo.validate_todo_data({'title': ''})
        assert is_valid == False
        assert error is not None
    
    def test_todo_validation_no_title(self):
        """Test Todo validation without title."""
        is_valid, error = Todo.validate_todo_data({})
        assert is_valid == False
        assert error is not None
    
    def test_todo_validation_valid_data(self):
        """Test Todo validation with valid data."""
        is_valid, error = Todo.validate_todo_data({'title': 'Valid Title'})
        assert is_valid == True
        assert error is None
    
    def test_todo_validation_update_mode(self):
        """Test Todo validation in update mode (title not required)."""
        is_valid, error = Todo.validate_todo_data({'completed': True}, is_update=True)
        assert is_valid == True
        assert error is None


class TestIntegrationScenarios:
    """Integration test scenarios."""
    
    def test_complete_todo_workflow(self, client):
        """Test complete workflow: create, read, update, delete."""
        # Create
        create_response = client.post('/api/todos',
                                     data=json.dumps({'title': 'Workflow Test'}),
                                     content_type='application/json')
        assert create_response.status_code == 201
        todo = json.loads(create_response.data)
        todo_id = todo['id']
        
        # Read
        read_response = client.get(f'/api/todos/{todo_id}')
        assert read_response.status_code == 200
        
        # Update
        update_response = client.put(f'/api/todos/{todo_id}',
                                     data=json.dumps({'completed': True}),
                                     content_type='application/json')
        assert update_response.status_code == 200
        updated_todo = json.loads(update_response.data)
        assert updated_todo['completed'] == True
        
        # Delete
        delete_response = client.delete(f'/api/todos/{todo_id}')
        assert delete_response.status_code == 200
        
        # Verify deletion
        verify_response = client.get(f'/api/todos/{todo_id}')
        assert verify_response.status_code == 404
    
    def test_multiple_todos_management(self, client):
        """Test managing multiple todos."""
        # Create multiple todos
        todos = []
        for i in range(5):
            response = client.post('/api/todos',
                                  data=json.dumps({'title': f'Todo {i}'}),
                                  content_type='application/json')
            todos.append(json.loads(response.data))
        
        # Get all todos
        response = client.get('/api/todos')
        all_todos = json.loads(response.data)
        assert len(all_todos) == 5
        
        # Update some todos
        for i in range(3):
            client.put(f'/api/todos/{todos[i]["id"]}',
                      data=json.dumps({'completed': True}),
                      content_type='application/json')
        
        # Delete some todos
        for i in range(2):
            client.delete(f'/api/todos/{todos[i]["id"]}')
        
        # Verify final state
        response = client.get('/api/todos')
        remaining_todos = json.loads(response.data)
        assert len(remaining_todos) == 3

# Made with Bob
