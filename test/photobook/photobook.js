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
// Gallery authentication and sign out.
const signOutButton = document.getElementById("signOutButton");

if (signOutButton) {
  async function checkGallerySession() {
    const { data, error } = await db.auth.getUser();

    if (error || !data.user) {
      window.location.replace("index.html");
      return;
    }

    const accountStatus = document.getElementById("accountStatus");
const { data: membershipData, error: membershipError } = await db
  .from("photobook_members")
  .select("role")
  .eq("user_id", data.user.id)
  .single();

if (membershipError || !membershipData) {
  await db.auth.signOut();
  window.location.replace("index.html");
  return;
}

accountStatus.textContent =
  membershipData.role === "poster" ? "Poster" : "Viewer";  }

if (membershipData.role === "poster") {
  document.getElementById("uploadButton").hidden = false;
}

  checkGallerySession();

  signOutButton.addEventListener("click", async function () {
    signOutButton.disabled = true;
    signOutButton.textContent = "Signing out...";

    await db.auth.signOut();

    window.location.replace("index.html");
  });
}
const uploadButton = document.getElementById("uploadButton");
const uploadPanel = document.getElementById("uploadPanel");

if (uploadButton && uploadPanel) {
  uploadButton.addEventListener("click", function () {
    uploadPanel.hidden = !uploadPanel.hidden;
  });
}