from flask_login import UserMixin
from backend import db, login_manager


class User(db.Model, UserMixin):
    __tablename__ = "user"
    __table_args__ = {'extend_existing': True}  # 防止重复定义表

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(200))


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))