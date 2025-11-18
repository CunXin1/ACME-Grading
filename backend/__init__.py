# backend/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager

# Global database instance shared across the application.
db = SQLAlchemy()

# Global LoginManager instance used for handling authentication.
login_manager = LoginManager()


def create_app():
    """
    Application factory function for initializing the Flask app.
    Configures extensions, database, blueprints, and core settings.
    """
    app = Flask(__name__)
    CORS(app)  # Enable CORS to allow frontend access from different ports.

    # Initialize the Flask-Login manager.
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"  # Optional: default redirect route for login errors.

    # Build the path to the SQLite database file.
    # Stores app.db inside the project's /database directory.
    base_dir = os.path.abspath(os.path.dirname(__file__))           # Points to backend/
    db_path = os.path.join(base_dir, "..", "database", "app.db")    # -> database/app.db

    # SQLAlchemy configuration settings.
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "super-secret-key"  # Used for session and login security.

    # Bind SQLAlchemy to the Flask application.
    db.init_app(app)

    # Register blueprints (imported here to avoid circular dependencies).
    from backend.routes.auth import auth_bp
    from backend.routes.student import student_bp
    from backend.routes.teacher import teacher_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(teacher_bp, url_prefix="/api/teacher")

    # Automatically create database tables if they don't exist.
    with app.app_context():
        db.create_all()

    # Console output showing all registered routes (for debugging).
    print("Flask app created successfully with routes:")
    for rule in app.url_map.iter_rules():
        if rule.endpoint != "static":
            print(f"   {rule.rule}")

    return app
