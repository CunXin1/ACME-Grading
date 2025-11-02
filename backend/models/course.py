from backend import db

class Course(db.Model):
    __tablename__ = "course"  # ✅ 一定要是 course，不是 class！
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50))
    capacity = db.Column(db.Integer)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))
