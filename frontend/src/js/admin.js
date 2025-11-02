async function loadData() {
  const res = await fetch("http://127.0.0.1:5000/api/admin/data");
  const data = await res.json();
  const teachers = data.teachers;
  const classes = data.classes;

  const tbody = document.getElementById("assignRows");
  tbody.innerHTML = "";

  classes.forEach((c) => {
    const row = document.createElement("tr");

    // 创建教师下拉框
    const select = document.createElement("select");
    teachers.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = t.name;
      if (t.name === c.teacher) option.selected = true;
      select.appendChild(option);
    });

    const currentTeacher = c.teacher ? c.teacher : "<i>None</i>";

    row.innerHTML = `
      <td>${c.name}</td>
      <td>${currentTeacher}</td>
      <td></td>
      <td><button class="assignBtn">Assign</button></td>
    `;

    row.children[2].appendChild(select);

    // 绑定事件
    row.querySelector(".assignBtn").addEventListener("click", async () => {
      const teacherId = select.value;
      const res = await fetch("http://127.0.0.1:5000/api/admin/assign_teacher", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: c.id, teacher_id: teacherId }),
      });
      const result = await res.json();
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

loadData();
