from datetime import datetime
from database import db

class Todo(db.Model):
    """
    Todo model representing a single todo item.
    
    Attributes:
        id: Unique identifier (auto-generated)
        title: Todo title (required)
        description: Optional detailed description
        completed: Boolean flag for completion status
        created_at: Timestamp of creation
    """
    __tablename__ = 'todos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        """String representation of Todo object."""
        return f'<Todo {self.id}: {self.title}>'
    
    def to_dict(self):
        """
        Convert Todo object to dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the todo
        """
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def validate_todo_data(data, is_update=False):
        """
        Validate todo data before creating or updating.
        
        Args:
            data: Dictionary containing todo data
            is_update: Boolean indicating if this is an update operation
            
        Returns:
            tuple: (is_valid, error_message)
        """
        if not is_update:
            # Title is required for new todos
            if 'title' not in data or not data['title'] or not data['title'].strip():
                return False, "Title is required and cannot be empty"
        
        # Validate title length if provided
        if 'title' in data and data['title']:
            if len(data['title'].strip()) > 200:
                return False, "Title cannot exceed 200 characters"
        
        # Validate completed field if provided
        if 'completed' in data and not isinstance(data['completed'], bool):
            return False, "Completed must be a boolean value"
        
        return True, None

# Made with Bob
