// -------------------- Load Logged-In User --------------------
const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "./login.html";  // Redirect if not authenticated.

const welcome = document.getElementById("welcome");
const logout = document.getElementById("logout");
const tableBody = document.getElementById("courseRows");
const actionHeader = document.getElementById("actionHeader");

// Display greeting message.
welcome.textContent = `Welcome ${user.name}!`;
let showingMyCourses = true;


// -------------------- Logout Listener --------------------
logout.addEventListener("click", () => {
  localStorage.removeItem("user");  // Clear session info.
  window.location.href = "./login.html";
});


// -------------------- Tab Switching --------------------
document.getElementById("myCoursesTab").addEventListener("click", () => {
  showingMyCourses = true;
  loadMyCourses();  // Load only the student's courses.
  document.getElementById("myCoursesTab").classList.add("active");
  document.getElementById("allCoursesTab").classList.remove("active");
});

document.getElementById("allCoursesTab").addEventListener("click", () => {
  showingMyCourses = false;
  loadAllCourses();  // Load all available courses.
  document.getElementById("allCoursesTab").classList.add("active");
  document.getElementById("myCoursesTab").classList.remove("active");
});


// -------------------- Load Student's Enrolled Courses --------------------
async function loadMyCourses() {
  actionHeader.textContent = "Drop";  // Column header changes depending on mode.

  const res = await fetch(`http://127.0.0.1:5000/api/student/myclasses/${user.id}`);
  const data = await res.json();
  tableBody.innerHTML = "";  // Clear previous table contents.

  data.forEach((c) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${c.class}</td>
      <td>${c.teacher}</td>
      <td>${c.time}</td>
      <td>${c.students}/${c.capacity}</td>
      <td style="text-align:center; color:red; font-size:20px; cursor:pointer;">−</td>
    `;

    // Drop course handler
    row.lastElementChild.addEventListener("click", async () => {
      if (!confirm(`Are you sure you want to drop ${c.class}?`)) return;

      const res = await fetch("http://127.0.0.1:5000/api/student/drop", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: user.id, class_id: c.id }),
      });

      if (res.ok) {
        alert(`Dropped ${c.class}.`);
        loadMyCourses();  // Refresh list after dropping.
      } else {
        alert("Failed to drop course.");
      }
    });

    tableBody.appendChild(row);
  });
}


// -------------------- Load All Courses --------------------
async function loadAllCourses() {
  actionHeader.textContent = "Add class";

  const res = await fetch("http://127.0.0.1:5000/api/student/classes");
  const all = await res.json();

  // Get the student's current enrollments to mark enrollment state.
  const myRes = await fetch(`http://127.0.0.1:5000/api/student/myclasses/${user.id}`);
  const my = await myRes.json();
  const myNames = my.map((c) => c.class);

  tableBody.innerHTML = "";

  all.forEach((c) => {
    const isFull = c.students >= c.capacity;  // Check if class is full.
    const isEnrolled = myNames.includes(c.name);  // Student already enrolled?
    const icon = isEnrolled ? "−" : isFull ? "✖" : "+";  // UI icon depending on state.
    const color = isEnrolled ? "red" : isFull ? "gray" : "green";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.teacher}</td>
      <td>${c.time}</td>
      <td>${c.students}/${c.capacity}</td>
      <td style="text-align:center; color:${color}; font-size:20px; cursor:pointer;">${icon}</td>
    `;

    // Enrollment handler (only when class is available)
    if (!isFull && !isEnrolled) {
      row.lastElementChild.addEventListener("click", async () => {
        const res = await fetch("http://127.0.0.1:5000/api/student/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: user.id, class_id: c.id }),
        });

        if (res.ok) {
          alert(`Successfully enrolled in ${c.name}!`);
          loadAllCourses();  // Refresh display
        } else {
          alert("Failed to enroll.");
        }
      });
    }

    tableBody.appendChild(row);
  });
}


// -------------------- Load “My Courses” by Default --------------------
loadMyCourses();
