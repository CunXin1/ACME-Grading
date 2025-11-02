// 获取登录用户
const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "./login.html";

const welcome = document.getElementById("welcome");
const logout = document.getElementById("logout");
const tableBody = document.getElementById("courseRows");
const actionHeader = document.getElementById("actionHeader");

// 初始化
welcome.textContent = `Welcome ${user.name}!`;
let showingMyCourses = true;

// 监听登出
logout.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "./login.html";
});

// 切换标签页
document.getElementById("myCoursesTab").addEventListener("click", () => {
  showingMyCourses = true;
  loadMyCourses();
  document.getElementById("myCoursesTab").classList.add("active");
  document.getElementById("allCoursesTab").classList.remove("active");
});

document.getElementById("allCoursesTab").addEventListener("click", () => {
  showingMyCourses = false;
  loadAllCourses();
  document.getElementById("allCoursesTab").classList.add("active");
  document.getElementById("myCoursesTab").classList.remove("active");
});

// 加载“我的课程”
async function loadMyCourses() {
  actionHeader.textContent = "Drop";
  const res = await fetch(`http://127.0.0.1:5000/api/student/myclasses/${user.id}`);
  const data = await res.json();
  tableBody.innerHTML = "";

  data.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.class}</td>
      <td>${c.teacher}</td>
      <td>${c.time}</td>
      <td>${c.students}/${c.capacity}</td>
      <td style="text-align:center; color:red; font-size:20px; cursor:pointer;">−</td>
    `;

    // 点击退课
    row.lastElementChild.addEventListener("click", async () => {
      if (!confirm(`Are you sure you want to drop ${c.class}?`)) return;

      const res = await fetch("http://127.0.0.1:5000/api/student/drop", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: user.id, class_id: c.id }),
      });

      if (res.ok) {
        alert(`Dropped ${c.class}.`);
        loadMyCourses();
      } else {
        alert("Failed to drop course.");
      }
    });

    tableBody.appendChild(row);
  });
}


// 加载“所有课程”
async function loadAllCourses() {
  actionHeader.textContent = "Add class";
  const res = await fetch("http://127.0.0.1:5000/api/student/classes");
  const all = await res.json();

  const myRes = await fetch(`http://127.0.0.1:5000/api/student/myclasses/${user.id}`);
  const my = await myRes.json();
  const myNames = my.map((c) => c.class);

  tableBody.innerHTML = "";
  all.forEach((c) => {
    const isFull = c.students >= c.capacity;
    const isEnrolled = myNames.includes(c.name);
    const icon = isEnrolled ? "−" : isFull ? "✖" : "+";
    const color = isEnrolled ? "red" : isFull ? "gray" : "green";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.teacher}</td>
      <td>${c.time}</td>
      <td>${c.students}/${c.capacity}</td>
      <td style="text-align:center; color:${color}; font-size:20px; cursor:pointer;">${icon}</td>
    `;

    // 报名逻辑
    if (!isFull && !isEnrolled) {
      row.lastElementChild.addEventListener("click", async () => {
        const res = await fetch("http://127.0.0.1:5000/api/student/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: user.id, class_id: c.id }),
        });
        if (res.ok) {
          alert(`Successfully enrolled in ${c.name}!`);
          loadAllCourses();
        } else {
          alert("Failed to enroll.");
        }
      });
    }

    tableBody.appendChild(row);
  });
}

// 默认加载“我的课程”
loadMyCourses();
