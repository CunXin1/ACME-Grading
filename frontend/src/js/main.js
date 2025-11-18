// frontend/src/js/main.js

// -------------------- Login Form Submission --------------------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page reload on form submit.

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error");

  try {
    // Send login request to backend /api/auth/login
    const res = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // Display error message if login failed.
    if (!res.ok) {
      errorMsg.textContent = data.error || "Login failed";
      return;
    }

    // Store logged-in user info in localStorage for later use.
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect based on the user's role.
    if (data.user.role === "student") {
      window.location.href = "./student.html";
    } else if (data.user.role === "teacher") {
      window.location.href = "./teacher.html";
    } else {
      alert("Unknown role.");
    }

  } catch (err) {
    // Handles network or backend-down scenarios.
    errorMsg.textContent = "Network error, check backend server.";
  }
});


// -------------------- Registration Box Toggle --------------------
document.getElementById("showRegister").addEventListener("click", (e) => {
  e.preventDefault();
  // Display the hidden registration form.
  document.getElementById("registerBox").style.display = "block";
});


// -------------------- Registration Request --------------------
document.getElementById("registerBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const role = document.getElementById("regRole").value;
  const regMsg = document.getElementById("regMsg");

  try {
    // Send registration data to backend /api/auth/register
    const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    // Display error message if registration fails.
    if (!res.ok) {
      regMsg.textContent = data.error || "Registration failed";
      return;
    }

    // Show success confirmation in green text.
    regMsg.style.color = "green";
    regMsg.textContent = "Registration successful! You can now log in.";

    // Automatically close the registration form after a delay.
    setTimeout(() => {
      document.getElementById("registerBox").style.display = "none";
    }, 1500);

  } catch (err) {
    // Handle connection failure.
    regMsg.textContent = "Network error, please try again.";
  }
});
