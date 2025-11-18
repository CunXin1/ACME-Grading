from flask_login import UserMixin
from backend import db, login_manager


class User(db.Model, UserMixin):
    """
    SQLAlchemy model representing a user in the system.
    A user can be either a student or a teacher, depending on the role field.
    UserMixin provides default implementations required by Flask-Login.
    """

    __tablename__ = "user"  # Name of the table storing user records.
    __table_args__ = {'extend_existing': True}  # Allows the table definition to be extended if needed.

    id = db.Column(db.Integer, primary_key=True)
    # Unique user identifier.

    name = db.Column(db.String(50), nullable=False)
    # Display name for the user (used for teachers and students).

    role = db.Column(db.String(20), nullable=False)
    # Defines the type of user (e.g., "student" or "teacher").

    email = db.Column(db.String(100), unique=True)
    # Email used for login; must be unique.

    password = db.Column(db.String(200))
    # Hashed password for authentication.


@login_manager.user_loader
def load_user(user_id):
    """
    Callback required by Flask-Login.
    Loads a user object from the database given a stored session user_id.
    """
    return User.query.get(int(user_id))
