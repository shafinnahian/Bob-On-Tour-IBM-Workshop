from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance
db = SQLAlchemy()

def init_db(app):
    """
    Initialize the database with the Flask app.
    Creates all tables if they don't exist.
    
    Args:
        app: Flask application instance
    """
    db.init_app(app)
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database initialized successfully!")

# Made with Bob
