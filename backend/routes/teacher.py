from flask import Blueprint, jsonify, request
from backend import db
from backend.models.user import User
from backend.models.course import Course
from backend.models.enrollment import Enrollment

teacher_bp = Blueprint("teacher", __name__)

# 查看自己教的课程.  
@teacher_bp.route("/classes/<int:teacher_id>", methods=["GET"])
def get_teacher_classes(teacher_id):
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


# 查看课程学生与成绩
@teacher_bp.route("/classes/<int:class_id>/students", methods=["GET"])
def get_students_in_class(class_id):
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


# 修改成绩
@teacher_bp.route("/grade", methods=["PUT"])
def update_grade():
    data = request.json
    student_id = data.get("student_id")
    course_id = data.get("class_id")  # ⚠️ 保留前端字段名
    new_grade = data.get("grade")

    e = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not e:
        return jsonify({"error": "Enrollment not found"}), 404

    e.grade = new_grade
    db.session.commit()
    return jsonify({"message": "Grade updated successfully!"})
