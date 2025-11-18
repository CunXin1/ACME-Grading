from flask import Blueprint, jsonify, request
from flask_login import login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.user import User
from backend import db, login_manager

# Blueprint for authentication-related routes.
auth_bp = Blueprint("auth", __name__)


# -------------------- User Loader --------------------
@login_manager.user_loader
def load_user(user_id):
    """
    Required by Flask-Login to load a user from the session.
    Returns the User object associated with the stored user_id.
    """
    return User.query.get(int(user_id))


# -------------------- User Registration --------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Registers a new user.
    Accepts name, email, password, and optional role from JSON request data.
    Passwords are securely hashed before saving.
    Returns an error if the email is already registered.
    """
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")  # Default role is student.

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = generate_password_hash(password, method="pbkdf2:sha256")
    new_user = User(name=name, email=email, password=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registered successfully!"})


# -------------------- User Login --------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Logs a user into the system.
    Allows login using either email or username for convenience.
    Verifies the password using secure hashing.
    On success, logs the user in via Flask-Login and returns basic user info.
    """
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Allow login using either email or name.
    user = User.query.filter(
        (User.email == email) | (User.name == email)
    ).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"error": "Incorrect password"}), 401

    login_user(user)
    return jsonify({
        "message": "Login successful!",
        "user": {"id": user.id, "name": user.name, "role": user.role}
    })


# -------------------- User Logout --------------------
@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Logs the current user out by clearing the session
    through Flask-Login's logout_user() function.
    """
    logout_user()
    return jsonify({"message": "Logged out successfully"})


# -------------------- Current User Info --------------------
@auth_bp.route("/me", methods=["GET"])
def get_me():
    """
    Returns information about the currently authenticated user.
    If the client is not logged in, returns an authentication error.
    """
    if not current_user.is_authenticated:
        return jsonify({"error": "Not logged in"}), 401

    return jsonify({
        "id": current_user.id,
        "name": current_user.name,
        "role": current_user.role
    })
