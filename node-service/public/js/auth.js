const API = "http://localhost/ecommerce-crud/php-api";

function showMsg(text, type) {
  const m = document.getElementById("msg");
  m.textContent = text;
  m.className = "msg " + type;
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (password.length < 6) {
    showMsg("Password kam se kam 6 characters ka ho!", "error");
    return;
  }

  try {
    const res = await fetch(API + "/signup.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const json = await res.json();
    if (json.success) {
      showMsg("🎉 " + json.message, "success");
      setTimeout(() => (window.location.href = "login.html"), 1200);
    } else {
      showMsg(json.message, "error");
    }
  } catch (err) {
    showMsg("Server se connect nahi ho paya. XAMPP on hai?", "error");
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(API + "/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (json.success) {
      localStorage.setItem("user", JSON.stringify(json.user));
      showMsg("✅ Login successful! Redirecting...", "success");
      setTimeout(() => (window.location.href = "index.html"), 1000);
    } else {
      showMsg(json.message, "error");
    }
  } catch (err) {
    showMsg("Server se connect nahi ho paya. XAMPP on hai?", "error");
  }
}