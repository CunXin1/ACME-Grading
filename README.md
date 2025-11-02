ACME University Grading System

This project is a simple web-based grading management system built with Flask and Vanilla JavaScript.
It allows students to register, enroll in courses, and view their grades, while teachers can manage classes and update grades.
The system uses SQLite for data storage and Flask-Login for authentication


lab8/
├── backend/           # Flask backend
│   ├── app.py
│   ├── init.py
│   ├── models/
│   └── routes/
├── database/          # Database initialization scripts
├── frontend/          # HTML/CSS/JS frontend
│   ├── index.html
│   ├── login.html
│   ├── student.html
│   ├── teacher.html
│   └── src/
│       ├── css/
│       └── js/
├── README.md
└── requirements.txt

Admin Page
http://127.0.0.1:5000/admin

Setup and Run
1. Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate        # macOS/Linux
 .venv\Scripts\activate         # Windows

pip install -r requirements.txt

2. Initialize database
python database/seed.py

3. Start Flask backend
python backend/app.py

Server runs at:
http://127.0.0.1:5000

4. Start frontend
cd frontend
python3 -m http.server 5500

Then open in browser:
http://127.0.0.1:5500/login.html


Default credentials (for testing)
Teacher: ralphjenkins@school.edu / ralphjenkins
Student: josesantos@school.edu / josesantos
