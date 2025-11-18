# backend/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager


# 全局数据库实例
db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    """Flask App Factory"""
    app = Flask(__name__)
    CORS(app)

    login_manager.init_app(app)
    login_manager.login_view = "auth.login"  # 可选：出错时跳转的视图名


    # 统一数据库路径（放在项目根目录 lab8/app.db）
    # backend/__init__.py
    base_dir = os.path.abspath(os.path.dirname(__file__))           # backend/
    db_path = os.path.join(base_dir, "..", "database", "app.db")    # ✅ database/app.db
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "super-secret-key"

    db.init_app(app)

    # 注册蓝图（延迟导入避免循环）
    from backend.routes.auth import auth_bp
    from backend.routes.student import student_bp
    from backend.routes.teacher import teacher_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(teacher_bp, url_prefix="/api/teacher")

    # 自动建表
    with app.app_context():
        db.create_all()

    print("Flask app created successfully with routes:")
    for rule in app.url_map.iter_rules():
        if rule.endpoint != "static":
            print(f"   {rule.rule}")

    return app
  