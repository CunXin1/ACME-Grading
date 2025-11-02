// frontend/src/js/main.js

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error");

  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || "Login failed";
      return;
    }

    // 保存登录用户信息
    localStorage.setItem("user", JSON.stringify(data.user));

    // 按角色跳转
    if (data.user.role === "student") {
      window.location.href = "./student.html";
    } else if (data.user.role === "teacher") {
      window.location.href = "./teacher.html";
    } else {
      alert("Unknown role.");
    }
  } catch (err) {
    errorMsg.textContent = "Network error, check backend server.";
  }
});

// 注册功能逻辑
document.getElementById("showRegister").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("registerBox").style.display = "block";
});

document.getElementById("registerBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const role = document.getElementById("regRole").value;
  const regMsg = document.getElementById("regMsg");

  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      regMsg.textContent = data.error || "Registration failed";
      return;
    }

    regMsg.style.color = "green";
    regMsg.textContent = "Registration successful! You can now log in.";

    // 自动返回登录表单
    setTimeout(() => {
      document.getElementById("registerBox").style.display = "none";
    }, 1500);
  } catch (err) {
    regMsg.textContent = "Network error, please try again.";
  }
});
