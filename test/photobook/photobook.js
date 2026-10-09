
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const message = document.getElementById("loginMessage");
    message.textContent = "Login setup is not connected yet.";
  });
}
