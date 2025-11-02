// frontend/src/js/teacher.js

const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "./login.html";

const welcome = document.getElementById("welcome");
const logout = document.getElementById("logout");
const classListView = document.getElementById("classListView");
const studentsView = document.getElementById("studentsView");
const classRows = document.getElementById("classRows");
const studentRows = document.getElementById("studentRows");
const courseTitle = document.getElementById("courseTitle");

welcome.textContent = `Welcome Dr ${user.name}!`;

// -------------------- 登出 --------------------
logout.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "./login.html";
});

// -------------------- 返回按钮 --------------------
document.getElementById("backBtn").addEventListener("click", () => {
  studentsView.style.display = "none";
  classListView.style.display = "block";
});

// -------------------- 加载教师授课列表 --------------------
async function loadClasses() {
  const res = await fetch(`http://127.0.0.1:5000/api/teacher/classes/${user.id}`);
  const data = await res.json();
  classRows.innerHTML = "";

  data.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="#" class="class-link" data-id="${c.id}">${c.name}</a></td>
      <td>${user.name}</td>
      <td>${c.time}</td>
      <td>${c.capacity}</td>
    `;
    classRows.appendChild(row);
  });

  // 点击课程名 → 查看学生
  document.querySelectorAll(".class-link").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const classId = link.dataset.id;
      const className = link.textContent;
      courseTitle.textContent = className;
      await loadStudents(classId);
      classListView.style.display = "none";
      studentsView.style.display = "block";
    });
  });
}

// -------------------- 加载学生列表 --------------------
async function loadStudents(classId) {
  const res = await fetch(`http://127.0.0.1:5000/api/teacher/classes/${classId}/students`);
  const data = await res.json();
  studentRows.innerHTML = "";

  data.forEach((s) => {
    const row = document.createElement("tr");
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

  // 监听编辑成绩
  document.querySelectorAll(".editable-grade").forEach((cell) => {
    cell.addEventListener("blur", async () => {
      const newGrade = parseFloat(cell.textContent.trim());
      const studentId = cell.dataset.studentid;
      const classId = cell.dataset.class;

      if (isNaN(newGrade)) {
        alert("Please enter a valid number.");
        cell.textContent = "";
        return;
      }

      const res = await fetch("http://127.0.0.1:5000/api/teacher/grade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          class_id: classId,
          grade: newGrade
        }),
      });

      if (res.ok) {
        cell.style.backgroundColor = "#d9f7d9";
        setTimeout(() => (cell.style.backgroundColor = ""), 800);
      } else {
        alert("Failed to update grade.");
      }
    });
  });
}

// -------------------- 初始化 --------------------
loadClasses();
