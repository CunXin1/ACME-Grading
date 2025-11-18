from backend import db

class Course(db.Model):
    """
    SQLAlchemy model representing a course in the system.
    Each course has basic information such as name, time, capacity,
    and is linked to a teacher through a foreign key.
    """

    __tablename__ = "course"  # Set explicit table name to avoid using reserved keywords.
    __table_args__ = {'extend_existing': True}  # Allow updating the table if it already exists.

    id = db.Column(db.Integer, primary_key=True)  
    # Unique course identifier.

    name = db.Column(db.String(50), nullable=False)  
    # Course name; cannot be empty.

    time = db.Column(db.String(50))  
    # Optional field storing the schedule or class time.

    capacity = db.Column(db.Integer)  
    # Maximum number of students allowed to enroll.

    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))  
    # Foreign key linking this course to the teacher (User model).
