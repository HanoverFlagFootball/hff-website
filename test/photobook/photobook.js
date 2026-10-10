// Connect to our Family Photobook Supabase project.
const SUPABASE_URL = "https://puthhhnedurxircaglqe.supabase.co";
const SUPABASE_KEY = "sb_publishable_kbZEajQHaUiB96HqfEutvQ_zFoOwcCB";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Handle the login form.
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    message.textContent = "Signing in...";

    const { data, error } = await db.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      message.textContent = error.message;
      return;
    }

    if (data.session) {
      window.location.href = "gallery.html";
    }
  });
}