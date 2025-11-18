// frontend/src/js/teacher.js

// -------------------- Load Logged-In Teacher --------------------
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


// -------------------- Logout --------------------
logout.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "./login.html";
});


// -------------------- Back Button --------------------
document.getElementById("backBtn").addEventListener("click", () => {
  studentsView.style.display = "none";
  classListView.style.display = "block";
});


// -------------------- Load Courses --------------------
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

  document.querySelectorAll(".class-link").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const classId = link.dataset.id;
      const className = link.textContent;

      courseTitle.textContent = className;

      // ⬅ 必须先显示页面，再绘制图表
      classListView.style.display = "none";
      studentsView.style.display = "block";

      await loadStudents(classId);
    });
  });
}


// -------------------- Load Students in Course --------------------
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

  // Draw chart AFTER table loads
  drawScoreChart(data);

  // Grade editing
  document.querySelectorAll(".editable-grade").forEach((cell) => {
    cell.addEventListener("blur", async () => {
      const newGrade = parseFloat(cell.textContent.trim());
      const studentId = cell.dataset.studentid;

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

        // Refresh chart
        const newData = await fetch(`http://127.0.0.1:5000/api/teacher/classes/${classId}/students`);
        drawScoreChart(await newData.json());
      } else {
        alert("Failed to update grade.");
      }
    });
  });
}


// -------------------- Draw Grade Distribution Pie Chart --------------------
function drawScoreChart(data) {
  let low = 0;    // 0–60
  let mid = 0;    // 60–80
  let high = 0;   // 80+

  data.forEach(s => {
    if (s.grade === null) return;
    if (s.grade < 60) low++;
    else if (s.grade < 80) mid++;
    else high++;
  });

  // Destroy previous chart instance if it exists
  if (window.scoreChart && typeof window.scoreChart.destroy === "function") {
    window.scoreChart.destroy();
  }

  const canvas = document.getElementById("scoreChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Create gradient colors 
  const gradRed = ctx.createLinearGradient(0, 0, 0, 250);
  gradRed.addColorStop(0, "#ff8a8a");
  gradRed.addColorStop(1, "#ff4d4d");

  const gradYellow = ctx.createLinearGradient(0, 0, 0, 250);
  gradYellow.addColorStop(0, "#ffe89c");
  gradYellow.addColorStop(1, "#ffd466");

  const gradGreen = ctx.createLinearGradient(0, 0, 0, 250);
  gradGreen.addColorStop(0, "#8df3b5");
  gradGreen.addColorStop(1, "#52d688");

  // Create pie chart
  window.scoreChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["0–60", "60–80", "80+"],
      datasets: [{
        data: [low, mid, high],
        backgroundColor: [gradRed, gradYellow, gradGreen],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 12,
        spacing: 3
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            font: { size: 15 }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
}


// -------------------- Initial Load --------------------
loadClasses();
