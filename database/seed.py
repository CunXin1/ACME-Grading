# database/seed.py
import os, sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from backend import create_app, db
from backend.models.user import User
from backend.models.course import Course
from backend.models.enrollment import Enrollment
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    print("🧹 Dropping all tables...")
    db.drop_all()
    print("🧱 Creating all tables...")
    db.create_all()

    def make_email(name):
        # 生成简单邮箱：空格→点，小写
        return name.replace(" ", "").lower() + "@school.edu"

    def make_password(name):
        # 默认密码为 name（全小写）+ "123"
        return generate_password_hash(name.replace(" ", "").lower(), method="pbkdf2:sha256")

    # ---- 教师 ----
    teachers = [
        User(name="Ralph Jenkins", role="teacher"),
        User(name="Susan Walker", role="teacher"),
        User(name="Ammon Hepworth", role="teacher")
    ]

    # ---- 学生 ----
    students = [
        User(name="Jose Santos", role="student"),
        User(name="Betty Brown", role="student"),
        User(name="John Stuart", role="student"),
        User(name="Li Cheng", role="student"),
        User(name="Nancy Little", role="student"),
        User(name="Mindy Norris", role="student"),
        User(name="Aditya Ranganath", role="student"),
        User(name="Yi Wen Chen", role="student")
    ]

    # ---- 统一补全邮箱和密码 ----
    for u in teachers + students:
        u.email = make_email(u.name)
        u.password = make_password(u.name)

    db.session.add_all(teachers + students)
    db.session.commit()

    # ---- 课程 ----
    math = Course(name="Math 101", teacher_id=teachers[0].id, time="MWF 10:00-10:50 AM", capacity=8)
    physics = Course(name="Physics 121", teacher_id=teachers[1].id, time="TR 11:00-11:50 AM", capacity=10)
    cs106 = Course(name="CS 106", teacher_id=teachers[2].id, time="MWF 2:00-2:50 PM", capacity=10)
    cs162 = Course(name="CS 162", teacher_id=teachers[2].id, time="TR 3:00-3:50 PM", capacity=4)

    db.session.add_all([math, physics, cs106, cs162])
    db.session.commit()

    # ---- 选课及成绩 ----
    enrollments = [
        ("Jose Santos", math, 92),
        ("Betty Brown", math, 65),
        ("John Stuart", math, 86),
        ("Li Cheng", math, 77),
        ("Nancy Little", physics, 53),
        ("Li Cheng", physics, 85),
        ("Mindy Norris", physics, 94),
        ("John Stuart", physics, 91),
        ("Betty Brown", physics, 88),
        ("Aditya Ranganath", cs106, 93),
        ("Yi Wen Chen", cs106, 85),
        ("Nancy Little", cs106, 57),
        ("Mindy Norris", cs106, 68),
        ("Aditya Ranganath", cs162, 99),
        ("Nancy Little", cs162, 87),
        ("Yi Wen Chen", cs162, 92),
        ("John Stuart", cs162, 67),
    ]

    name_to_user = {u.name: u for u in teachers + students}
    for student_name, course, grade in enrollments:
        db.session.add(
            Enrollment(student_id=name_to_user[student_name].id, course_id=course.id, grade=grade)
        )

    db.session.commit()
    print("🎉 Database seeded successfully with default emails & passwords!")
