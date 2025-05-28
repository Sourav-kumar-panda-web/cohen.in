document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // Check if the student is logged in (e.g., login status saved in localStorage)
  const isLoggedIn = localStorage.getItem("isStudentLoggedIn") === "true";

  if (isLoggedIn) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  }

  logoutBtn.addEventListener("click", () => {
    // Clear login status and redirect to login page
    localStorage.removeItem("isStudentLoggedIn");
    window.location.href = "login.html";
  });
});
