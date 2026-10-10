// Family Photobook. Only the public Supabase key belongs in browser code.
const SUPABASE_URL = "https://puthhhnedurxircaglqe.supabase.co";
const SUPABASE_KEY = "sb_publishable_kbZEajQHaUiB96HqfEutvQ_zFoOwcCB";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "family-photos";

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("loginMessage");
    message.textContent = "Signing in...";
    const { data, error } = await db.auth.signInWithPassword({
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    });
    if (error) { message.textContent = error.message; return; }
    if (data.session) window.location.href = "gallery.html";
  });
}

const signOutButton = document.getElementById("signOutButton");
if (signOutButton) {
  const status = document.getElementById("accountStatus");
  const uploadButton = document.getElementById("uploadButton");
  const uploadPanel = document.getElementById("uploadPanel");
  const incompleteTab = document.getElementById("incompleteTab");
  const galleryTab = document.getElementById("galleryTab");
  const incompleteSection = document.getElementById("incompleteSection");
  const photoGallery = document.getElementById("photoGallery");
  const galleryMessage = document.getElementById("galleryMessage");
  let isPoster = false;

  async function checkGallerySession() {
    try {
      const { data, error } = await db.auth.getUser();
      if (error || !data.user) { window.location.replace("index.html"); return; }
      const { data: membership, error: membershipError } = await db
        .from("photobook_members").select("role")
        .eq("user_id", data.user.id).single();
      if (membershipError || !membership) {
        await db.auth.signOut();
        window.location.replace("index.html");
        return;
      }
      isPoster = membership.role === "poster";
      status.textContent = isPoster ? "Poster" : "Viewer";
      uploadButton.hidden = !isPoster;
      incompleteTab.hidden = !isPoster;
      await loadPhotos();
    } catch (error) {
      status.textContent = "Could not check account";
      galleryMessage.textContent = error.message;
    }
  }

  function showSection(which) {
    const incomplete = which === "incomplete" && isPoster;
    incompleteSection.hidden = !incomplete;
    photoGallery.hidden = incomplete;
    galleryTab.classList.toggle("active", !incomplete);
    incompleteTab.classList.toggle("active", incomplete);
  }
  galleryTab.addEventListener("click", () => showSection("gallery"));
  incompleteTab.addEventListener("click", () => showSection("incomplete"));
  uploadButton.addEventListener("click", () => {
    if (isPoster) uploadPanel.hidden = !uploadPanel.hidden;
  });

  async function renderPhotos(rows, target, emptyText) {
    target.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "empty-gallery";
      empty.textContent = emptyText;
      target.appendChild(empty);
      return;
    }
    // Signed URLs expire; request them again when the gallery reloads.
    for (const photo of rows) {
      const figure = document.createElement("figure");
      figure.className = "photo-tile";
      const image = document.createElement("img");
      image.alt = photo.caption || photo.original_filename || "Family photograph";
      image.loading = "lazy";
      const { data, error } = await db.storage.from(BUCKET)
        .createSignedUrl(photo.storage_path, 3600);
      if (!error && data?.signedUrl) image.src = data.signedUrl;
      const caption = document.createElement("figcaption");
      caption.textContent = `${photo.original_filename || "Photograph"} · ${photo.photo_month}/${photo.photo_year}`;
      figure.append(image, caption);
      target.appendChild(figure);
    }
  }

  async function loadPhotos() {
    galleryMessage.textContent = "Loading photographs...";
    const { data: complete, error: completeError } = await db.from("photos")
      .select("id, storage_path, photo_month, photo_year, caption, original_filename")
      .eq("is_complete", true).order("created_at", { ascending: false }).limit(200);
    if (completeError) { galleryMessage.textContent = completeError.message; return; }
    await renderPhotos(complete, photoGallery, "No completed photographs yet.");
    if (isPoster) {
      const { data: incomplete, error: incompleteError } = await db.from("photos")
        .select("id, storage_path, photo_month, photo_year, caption, original_filename")
        .eq("is_complete", false).order("created_at", { ascending: false }).limit(200);
      if (incompleteError) { galleryMessage.textContent = incompleteError.message; return; }
      document.getElementById("incompleteCount").textContent = `(${incomplete.length}${incomplete.length === 200 ? "+" : ""})`;
      await renderPhotos(incomplete, document.getElementById("incompleteGallery"), "No incomplete photographs.");
    }
    galleryMessage.textContent = "";
  }

  const submitPhotos = document.getElementById("submitPhotos");
  submitPhotos.addEventListener("click", async () => {
    if (!isPoster) return;
    const files = Array.from(document.getElementById("photoFiles").files);
    const month = Number(document.getElementById("photoMonth").value);
    const year = Number(document.getElementById("photoYear").value);
    const message = document.getElementById("uploadMessage");
    if (!files.length) { message.textContent = "Select at least one photograph."; return; }
    if (!Number.isInteger(month) || month < 1 || month > 12 ||
        !Number.isInteger(year) || year < 1800 || year > 2200) {
      message.textContent = "Choose a month and a year for this batch.";
      return;
    }
    submitPhotos.disabled = true;
    let uploaded = 0;
    const failures = [];
    try {
      for (const [index, file] of files.entries()) {
        message.textContent = `Uploading ${index + 1} of ${files.length}...`;
        if (!file.type.startsWith("image/")) {
          failures.push(`${file.name}: not an image`);
          continue;
        }
        const path = `${crypto.randomUUID()}/${crypto.randomUUID()}`;
        const { error: uploadError } = await db.storage.from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) { failures.push(`${file.name}: ${uploadError.message}`); continue; }
        const { error: insertError } = await db.from("photos").insert({
          storage_path: path,
          original_filename: file.name,
          photo_month: month,
          photo_year: year,
          is_complete: false
        });
        if (insertError) {
          // Don't leave an untracked private file if saving its database row fails.
          const { error: cleanupError } = await db.storage.from(BUCKET).remove([path]);
          failures.push(`${file.name}: ${insertError.message}${cleanupError ? " (file cleanup also failed)" : ""}`);
          continue;
        }
        uploaded++;
      }
      message.textContent = `${uploaded} photo(s) added to Incomplete.` +
        (failures.length ? `\n${failures.length} failed:\n${failures.join("\n")}` : "");
      if (uploaded) {
        document.getElementById("photoFiles").value = "";
        await loadPhotos();
        showSection("incomplete");
      }
    } catch (error) {
      message.textContent = `${uploaded} uploaded before an error: ${error.message}`;
    } finally {
      submitPhotos.disabled = false;
    }
  });

  signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;
    signOutButton.textContent = "Signing out...";
    await db.auth.signOut();
    window.location.replace("index.html");
  });
  checkGallerySession();
}
