# backend/app.py
import os, sys
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

# 兼容从不同目录运行
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend import create_app, db
from backend.models.user import User
from backend.models.course import Course
from backend.models.enrollment import Enrollment

class EnrollmentAdmin(ModelView):
    # ✅ 指定要显示的列（自定义两列）
    column_list = ["id", "student_name", "course_name", "grade"]

    # ✅ 定义属性函数，显示外键对应的名字
    def _student_name(view, context, model, name):
        return model.student.name if model.student else "N/A"

    def _course_name(view, context, model, name):
        return model.course.name if model.course else "N/A"
    # ✅ 把这些函数注册为列
    column_formatters = {
        "student_name": _student_name,
        "course_name": _course_name,
    }

# 创建应用
app = create_app()

# Flask-Admin
admin = Admin(app, name="Grade System Admin", template_mode="bootstrap3")
admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Course, db.session))
admin.add_view(EnrollmentAdmin(Enrollment, db.session))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    print("✅ Flask server running at http://127.0.0.1:5000")
    app.run(debug=True)
