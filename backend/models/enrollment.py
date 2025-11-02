from backend import db

class Enrollment(db.Model):
    __tablename__ = "enrollment"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"))
    grade = db.Column(db.Float)

    student = db.relationship("User", backref="enrollments", lazy=True)
    course = db.relationship("Course", backref="enrollments", lazy=True)
    
    def __repr__(self):
        return f"<Enrollment student_id={self.student_id} course_id={self.course_id} grade={self.grade}>"
