const SESSION_KEY = 'isLoggedIn';

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const studentProfileBtn = document.getElementById('student-profile-btn');
  const userWelcome = document.getElementById('user-welcome');
  const authButtons = document.getElementById('auth-buttons');
  const usernameDisplay = document.getElementById('usernameDisplay');

  const currentUser = "<%= typeof username !== 'undefined' ? username : '' %>";
  const isLoggedIn = currentUser && currentUser !== "<%= username ? username : '' %>";

  function updateAuthButtons() {
    if (isLoggedIn) {
      loginBtn?.style.setProperty('display', 'none');
      registerBtn?.style.setProperty('display', 'none');
      logoutBtn?.style.setProperty('display', 'inline-block');
      studentProfileBtn?.style.setProperty('display', 'inline-block');
      authButtons?.style.setProperty('display', 'none');
      userWelcome?.style.setProperty('display', 'block');
      usernameDisplay.textContent = currentUser;

      sessionStorage.setItem(SESSION_KEY, 'true');
    } else {
      loginBtn?.style.setProperty('display', 'inline-block');
      registerBtn?.style.setProperty('display', 'inline-block');
      logoutBtn?.style.setProperty('display', 'none');
      studentProfileBtn?.style.setProperty('display', 'none');
      authButtons?.style.setProperty('display', 'block');
      userWelcome?.style.setProperty('display', 'none');

      sessionStorage.setItem(SESSION_KEY, 'false');
    }
  }

  updateAuthButtons();

  logoutBtn?.addEventListener('click', function (e) {
    e.preventDefault();

    fetch('/logout', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          sessionStorage.removeItem(SESSION_KEY);
          alert("Logged out successfully!");
          window.location.href = '/login';
        } else {
          throw new Error("Logout failed");
        }
      })
      .catch(err => {
        console.error("Logout failed:", err);
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = '/login';
      });
  });
});

// Mobile nav toggle
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('active');
}
