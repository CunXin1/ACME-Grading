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


// -------------------- Toggle Between Register and Reset --------------------
const registerBox = document.getElementById("registerBox");
const resetBox = document.getElementById("resetBox");

document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();
    // Show register, hide reset
    registerBox.style.display = "block";
    resetBox.style.display = "none";
    // Clear any messages
    document.getElementById("regMsg").textContent = "";
    document.getElementById("resetMsg").textContent = "";
});

document.getElementById("showReset").addEventListener("click", (e) => {
    e.preventDefault();
    // Show reset, hide register
    resetBox.style.display = "block";
    registerBox.style.display = "none";
    // Clear any messages
    document.getElementById("regMsg").textContent = "";
    document.getElementById("resetMsg").textContent = "";
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
            regMsg.style.color = "red";
            regMsg.textContent = data.error || "Registration failed";
            return;
        }

        // Show success confirmation in green text.
        regMsg.style.color = "green";
        regMsg.textContent = "Registration successful! You can now log in.";

        // Automatically close the registration form after a delay.
        setTimeout(() => {
            registerBox.style.display = "none";
        }, 1500);

    } catch (err) {
        // Handle connection failure.
        regMsg.style.color = "red";
        regMsg.textContent = "Network error, please try again.";
    }
});


// -------------------- Password Reset Request --------------------
document.getElementById("resetBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.getElementById("resetEmail").value.trim();
    const resetMsg = document.getElementById("resetMsg");

    if (!email) {
        resetMsg.style.color = "red";
        resetMsg.textContent = "Please enter your email address.";
        return;
    }

    try {
        // Send password reset request to backend /api/auth/reset-password
        const res = await fetch("http://127.0.0.1:5000/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
            // Email exists - show success message
            resetMsg.style.color = "green";
            resetMsg.textContent = "Recovery email sent";

            // Clear form and hide after delay
            setTimeout(() => {
                resetBox.style.display = "none";
                document.getElementById("resetEmail").value = "";
            }, 2000);
        } else {
            // Email not found
            resetMsg.style.color = "red";
            resetMsg.textContent = "Email not recognized";
        }

    } catch (err) {
        // Handle connection failure.
        resetMsg.style.color = "red";
        resetMsg.textContent = "Network error, please try again.";
    }
});