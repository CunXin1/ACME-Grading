# backend/app.py

import os, sys
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView


# Import the application factory and database instance
# from the backend package. These are defined in backend/__init__.py.
# 兼容从不同目录运行
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
# # Relative Path Import
# from . import create_app, db 
# # 
from backend import create_app, db

# Import SQLAlchemy models used by the admin interface.
from backend.models.user import User
from backend.models.course import Course
from backend.models.enrollment import Enrollment


class EnrollmentAdmin(ModelView):
    """
    Custom ModelView for the Enrollment model.

    This custom view overrides the default column list and injects
    human-readable values for student_name and course_name.
    It is required because Enrollment uses foreign keys, and SQLAlchemy
    will normally display only the raw numeric IDs.
    """

    # Columns to display in the admin table.
    # "student_name" and "course_name" are virtual columns created below.
    column_list = ["id", "student_name", "course_name", "grade"]

    # Formatter: returns the student's name instead of showing student_id.
    @staticmethod
    def _student_name(view, context, model, name):
        # Protects against missing related rows (should rarely happen).
        return model.student.name if model.student else "N/A"

    # Formatter: returns the course name instead of course_id.
    @staticmethod
    def _course_name(view, context, model, name):
        return model.course.name if model.course else "N/A"

    # Register the custom column formatters so Flask-Admin uses them.
    column_formatters = {
        "student_name": _student_name,
        "course_name": _course_name,
    }

class CourseAdmin(ModelView):
    # Columns to display in list view
    column_list = ("teacher_name", "name", "time", "capacity")

    # Disable teacher_id from being displayed
    column_exclude_list = ("teacher_id",)

    # Format teacher_name column
    def _teacher_name(view, context, model, name):
        return model.teacher.name if model.teacher else "None"

    column_formatters = {
        "teacher_name": _teacher_name
    }


class MyAdminIndexView(AdminIndexView):
    """
    Custom Admin Index View that hides the Home menu item
    """
    def is_visible(self):
        # Return False to hide the Home link from the navigation menu
        return False


# Create the Flask application using the factory pattern.
# This ensures all configuration, database bindings, and blueprints
# are initialized in a clean, modular way.
app = create_app()

# Initialize Flask-Admin with custom index view that's hidden
# Setting url='/' keeps it as the root but is_visible=False hides the menu item
admin = Admin(
    app, 
    name="Grade System Admin", 
    index_view=MyAdminIndexView(name='Home', url='/admin')
)

# Register basic model views. These use default behavior.
# Flask-Admin
# admin = Admin(app, name="Grade System Admin")
# comment out the line above (accidentally re-initialized)

admin.add_view(ModelView(User, db.session))
admin.add_view(CourseAdmin(Course, db.session))
# Register the custom Enrollment admin view defined above.
admin.add_view(EnrollmentAdmin(Enrollment, db.session))


# Entry point when running with:
#   python -m backend.app
# or (less recommended) python backend/app.py
if __name__ == "__main__":
    # Ensure all SQLAlchemy tables exist before starting the server.
    # Without this, running the app in a fresh environment will cause failures.
    with app.app_context():
        db.create_all()

    print("Flask server running at http://127.0.0.1:5000")

    # Enable Flask debug mode (auto-reload, error debugger).
    app.run(debug=True)