from backend import db

class Enrollment(db.Model):
    """
    SQLAlchemy model representing a single enrollment record.
    Each record links one student to one course and can store
    an optional grade assigned by a teacher.
    """

    __tablename__ = "enrollment"  # Name of the table storing enrollment records.
    __table_args__ = {'extend_existing': True}  # Allow updating the table schema if needed.

    id = db.Column(db.Integer, primary_key=True)
    # Unique identifier for each enrollment entry.

    student_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    # ID of the student who is enrolled (foreign key to User model).

    course_id = db.Column(db.Integer, db.ForeignKey("course.id"))
    # ID of the course the student is enrolled in (foreign key to Course model).

    grade = db.Column(db.Float)
    # Student's grade for the course; may be empty before grading.

    student = db.relationship("User", backref="enrollments", lazy=True)
    # ORM relationship to the User model; provides access to the student object.

    course = db.relationship("Course", backref="enrollments", lazy=True)
    # ORM relationship to the Course model; provides access to the course object.

    def __repr__(self):
        # Helpful string output for debugging and logging.
        return f"<Enrollment student_id={self.student_id} course_id={self.course_id} grade={self.grade}>"
