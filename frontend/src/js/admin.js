async function loadData() {
  // Fetch all teachers and classes from the backend admin API.
  const res = await fetch("http://127.0.0.1:5000/api/admin/data");
  const data = await res.json();
  const teachers = data.teachers;
  const classes = data.classes;

  const tbody = document.getElementById("assignRows");
  tbody.innerHTML = ""; // Clear table before re-rendering.

  classes.forEach((c) => {
    const row = document.createElement("tr");

    // Create a dropdown <select> element for choosing a teacher.
    const select = document.createElement("select");
    teachers.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = t.name;

      // Pre-select the current teacher if the course already has one.
      if (t.name === c.teacher) option.selected = true;

      select.appendChild(option);
    });

    // Display current teacher or "None" if unassigned.
    const currentTeacher = c.teacher ? c.teacher : "<i>None</i>";

    // Construct the table row with course information and action button.
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${currentTeacher}</td>
      <td></td>
      <td><button class="assignBtn">Assign</button></td>
    `;

    // Insert the teacher dropdown into the third column.
    row.children[2].appendChild(select);

    // Bind click event to the "Assign" button.
    row.querySelector(".assignBtn").addEventListener("click", async () => {
      const teacherId = select.value;

      // Send assignment update request to the backend.
      const res = await fetch("http://127.0.0.1:5000/api/admin/assign_teacher", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: c.id, teacher_id: teacherId }),
      });

      const result = await res.json();

      // Show success or error message and refresh data.
      if (res.ok) {
        alert(result.message);
        loadData();
      } else {
        alert(result.error || "Failed to assign teacher");
      }
    });

    tbody.appendChild(row);
  });
}

// Initial load of the class + teacher assignment table.
loadData();
