from flask import Blueprint, jsonify, request
from flask_login import login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.user import User
from backend import db, login_manager

auth_bp = Blueprint("auth", __name__)

# -------------------- 用户加载函数 --------------------
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# -------------------- 注册新用户 --------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")  # 默认学生角色

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(name=name, email=email, password=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registered successfully!"})


# -------------------- 登录 --------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

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


# -------------------- 登出 --------------------
@auth_bp.route("/logout", methods=["POST"])
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})


# -------------------- 当前用户信息 --------------------
@auth_bp.route("/me", methods=["GET"])
def get_me():
    if not current_user.is_authenticated:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify({
        "id": current_user.id,
        "name": current_user.name,
        "role": current_user.role
    })
