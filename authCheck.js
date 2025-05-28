document.addEventListener("DOMContentLoaded", function () {
  fetch('/student-dashboard-data')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Logged in
        document.getElementById("auth-buttons").style.display = "none";
        document.getElementById("logout-section").style.display = "block";
      } else {
        // Not logged in
        document.getElementById("auth-buttons").style.display = "block";
        document.getElementById("logout-section").style.display = "none";
      }
    });

  document.getElementById("logout-btn").addEventListener("click", () => {
    fetch('/logout', {
      method: 'POST'
    }).then(() => {
      window.location.href = '/login';
    });
  });
});
