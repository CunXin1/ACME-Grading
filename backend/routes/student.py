from flask import Blueprint, jsonify, request
from backend import db
from backend.models.user import User
from backend.models.course import Course
from backend.models.enrollment import Enrollment

student_bp = Blueprint("student", __name__)

# 获取所有课程
@student_bp.route("/classes", methods=["GET"])
def get_all_classes():
    classes = Course.query.all()
    result = []
    for c in classes:
        teacher = User.query.get(c.teacher_id)
        count = Enrollment.query.filter_by(course_id=c.id).count()
        result.append({
            "id": c.id,
            "name": c.name,
            "teacher": teacher.name if teacher else None,
            "time": c.time,
            "capacity": c.capacity,
            "students": count
        })
    return jsonify(result)


# 获取学生自己的课程 + 成绩
@student_bp.route("/myclasses/<int:student_id>", methods=["GET"])
def get_my_classes(student_id):
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    result = []
    for e in enrollments:
        c = Course.query.get(e.course_id)
        teacher = User.query.get(c.teacher_id)
        count = Enrollment.query.filter_by(course_id=c.id).count()
        result.append({
            "id": c.id,
            "class": c.name,
            "teacher": teacher.name,
            "time": c.time,
            "grade": e.grade,
            "students": count,
            "capacity": c.capacity
        })
    return jsonify(result)


# 学生报名课程
@student_bp.route("/signup", methods=["POST"])
def signup_class():
    data = request.json
    student_id = data.get("student_id")
    course_id = data.get("class_id")  # ⚠️ 保留前端传入字段名，但赋值给 course_id

    c = Course.query.get(course_id)
    count = Enrollment.query.filter_by(course_id=course_id).count()
    if count >= c.capacity:
        return jsonify({"error": "Class is full"}), 400

    exist = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if exist:
        return jsonify({"error": "Already enrolled"}), 400

    new_enroll = Enrollment(student_id=student_id, course_id=course_id, grade=None)
    db.session.add(new_enroll)
    db.session.commit()
    return jsonify({"message": "Enrolled successfully!"})


@student_bp.route("/drop", methods=["DELETE"])
def drop_class():
    data = request.json
    student_id = data.get("student_id")
    course_id = data.get("class_id")  # ⚠️ 保留前端传入字段名

    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"error": "Not enrolled in this class"}), 404

    db.session.delete(enrollment)
    db.session.commit()
    return jsonify({"message": "Dropped successfully"})
