document.getElementById("utrForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = localStorage.getItem("userEmail");
  const utr = document.getElementById("utrInput").value;

  if (!email) {
    document.getElementById("utrMessage").innerText = "User not logged in.";
    return;
  }

  const response = await fetch("/save-utr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, utr })
  });

  const data = await response.json();

  if (data.success) {
    document.getElementById("utrMessage").innerText = "UTR submitted successfully.";
  } else {
    document.getElementById("utrMessage").innerText = data.message || "Error submitting UTR.";
  }
});
