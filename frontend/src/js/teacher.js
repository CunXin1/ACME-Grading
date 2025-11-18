// frontend/src/js/teacher.js

// -------------------- Load Logged-In Teacher --------------------
const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "./login.html"; // Redirect if not authenticated.

const welcome = document.getElementById("welcome");
const logout = document.getElementById("logout");
const classListView = document.getElementById("classListView");
const studentsView = document.getElementById("studentsView");
const classRows = document.getElementById("classRows");
const studentRows = document.getElementById("studentRows");
const courseTitle = document.getElementById("courseTitle");

welcome.textContent = `Welcome Dr ${user.name}!`;


// -------------------- Logout --------------------
logout.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "./login.html";
});


// -------------------- Back Button (Return to Course List) --------------------
document.getElementById("backBtn").addEventListener("click", () => {
  studentsView.style.display = "none";   // Hide student list
  classListView.style.display = "block"; // Show class list again
});


// -------------------- Load Classes Taught by This Teacher --------------------
async function loadClasses() {
  const res = await fetch(`http://127.0.0.1:5000/api/teacher/classes/${user.id}`);
  const data = await res.json();
  classRows.innerHTML = ""; // Clear existing rows.

  data.forEach((c) => {
    const row = document.createElement("tr");

    // Course row with clickable course name
    row.innerHTML = `
      <td><a href="#" class="class-link" data-id="${c.id}">${c.name}</a></td>
      <td>${user.name}</td>
      <td>${c.time}</td>
      <td>${c.capacity}</td>
    `;

    classRows.appendChild(row);
  });

  // Clicking a course loads its student list
  document.querySelectorAll(".class-link").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const classId = link.dataset.id;
      const className = link.textContent;

      courseTitle.textContent = className; // Display class title
      await loadStudents(classId);

      classListView.style.display = "none";
      studentsView.style.display = "block";
    });
  });
}


// -------------------- Load Students + Grades for a Class --------------------
async function loadStudents(classId) {
  const res = await fetch(`http://127.0.0.1:5000/api/teacher/classes/${classId}/students`);
  const data = await res.json();
  studentRows.innerHTML = ""; // Clear previous list.

  data.forEach((s) => {
    const row = document.createElement("tr");

    // Student name + editable grade cell
    row.innerHTML = `
      <td>${s.student}</td>
      <td contenteditable="true"
          class="editable-grade"
          data-studentid="${s.student_id}"
          data-class="${classId}">
        ${s.grade !== null ? s.grade : ""}
      </td>
    `;

    studentRows.appendChild(row);
  });

  // Grade editing handler
  document.querySelectorAll(".editable-grade").forEach((cell) => {
    cell.addEventListener("blur", async () => {
      const newGrade = parseFloat(cell.textContent.trim());
      const studentId = cell.dataset.studentid;
      const classId = cell.dataset.class;

      // Validate numeric input
      if (isNaN(newGrade)) {
        alert("Please enter a valid number.");
        cell.textContent = "";
        return;
      }

      // Submit grade update request
      const res = await fetch("http://127.0.0.1:5000/api/teacher/grade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          class_id: classId,
          grade: newGrade
        }),
      });

      // Visual feedback for successful update
      if (res.ok) {
        cell.style.backgroundColor = "#d9f7d9";
        setTimeout(() => (cell.style.backgroundColor = ""), 800);
      } else {
        alert("Failed to update grade.");
      }
    });
  });
}


// -------------------- Initial Load --------------------
loadClasses();
