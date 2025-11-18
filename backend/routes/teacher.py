from flask import Blueprint, jsonify, request
from backend import db
from backend.models.user import User
from backend.models.course import Course
from backend.models.enrollment import Enrollment

# Blueprint for teacher-related operations and class management.
teacher_bp = Blueprint("teacher", __name__)


# -------------------- Get Teacher's Courses --------------------
@teacher_bp.route("/classes/<int:teacher_id>", methods=["GET"])
def get_teacher_classes(teacher_id):
    """
    Returns all courses taught by the specified teacher.
    Only basic course information is returned since this is
    intended for display on the teacher's dashboard.
    """
    classes = Course.query.filter_by(teacher_id=teacher_id).all()
    result = []

    for c in classes:
        result.append({
            "id": c.id,
            "name": c.name,
            "time": c.time,
            "capacity": c.capacity
        })

    return jsonify(result)


# -------------------- Get Students and Grades in a Class --------------------
@teacher_bp.route("/classes/<int:class_id>/students", methods=["GET"])
def get_students_in_class(class_id):
    """
    Returns a list of all students enrolled in a specific class.
    Each entry includes the student's name, ID, and current grade.
    This allows teachers to view enrollment and grading status.
    """
    enrollments = Enrollment.query.filter_by(course_id=class_id).all()
    result = []

    for e in enrollments:
        student = User.query.get(e.student_id)
        result.append({
            "student": student.name,
            "student_id": student.id,
            "grade": e.grade
        })

    return jsonify(result)


# -------------------- Update Student Grade --------------------
@teacher_bp.route("/grade", methods=["PUT"])
def update_grade():
    """
    Updates a student's grade for a specific course.
    Expects student_id, class_id, and the new grade in the request body.
    Returns an error if the student is not enrolled in the class.
    """
    data = request.json
    student_id = data.get("student_id")
    course_id = data.get("class_id")  # Using frontend naming convention.
    new_grade = data.get("grade")

    e = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not e:
        return jsonify({"error": "Enrollment not found"}), 404

    e.grade = new_grade
    db.session.commit()

    return jsonify({"message": "Grade updated successfully!"})
