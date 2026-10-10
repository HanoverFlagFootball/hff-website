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
  let incompletePhotos = [];
  let currentPhotoIndex = -1;

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
      const dateLabel = photo.photo_month && photo.photo_year ? ` · ${photo.photo_month}/${photo.photo_year}` : "";
      caption.textContent = `${photo.original_filename || "Photograph"}${dateLabel}`;
      if (target.id === "incompleteGallery" && isPoster) {
        figure.classList.add("editable-tile");
        figure.tabIndex = 0;
        figure.setAttribute("role", "button");
        figure.setAttribute("aria-label", `Organize ${photo.original_filename || "photograph"}`);
        const open = () => openOrganizer(incompletePhotos.findIndex(item => item.id === photo.id));
        figure.addEventListener("click", open);
        figure.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
        });
      }
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
      incompletePhotos = incomplete;
      await renderPhotos(incomplete, document.getElementById("incompleteGallery"), "No incomplete photographs.");
    }
    galleryMessage.textContent = "";
  }

  const submitPhotos = document.getElementById("submitPhotos");
  submitPhotos.addEventListener("click", async () => {
    if (!isPoster) return;
    const files = Array.from(document.getElementById("photoFiles").files);
    const message = document.getElementById("uploadMessage");
    if (!files.length) { message.textContent = "Select at least one photograph."; return; }
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
          photo_month: null,
          photo_year: null,
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

  const organizer = document.getElementById("organizer");
  const organizerMessage = document.getElementById("organizerMessage");
  const editPeople = document.getElementById("editPeople");
  const editTags = document.getElementById("editTags");
  const editMonth = document.getElementById("editMonth");
  const editYear = document.getElementById("editYear");
  const editCaption = document.getElementById("editCaption");
  const saveButton = document.getElementById("savePhoto");
  const saveNextButton = document.getElementById("saveNextPhoto");
  const deleteButton = document.getElementById("deletePhoto");
  let organizerBusy = false;

  function parseTags(value) {
    return [...new Map(value.split(",").map(item => item.trim())
      .filter(Boolean).map(item => [item.toLocaleLowerCase(), item])).values()];
  }

  async function openOrganizer(index) {
    if (!isPoster || index < 0 || index >= incompletePhotos.length) return;
    currentPhotoIndex = index;
    const photo = incompletePhotos[index];
    organizer.hidden = false;
    organizerMessage.textContent = "Loading...";
    document.getElementById("organizerPosition").textContent = `Incomplete ${index + 1} of ${incompletePhotos.length}`;
    document.getElementById("organizerFilename").textContent = photo.original_filename || "Photograph";
    editMonth.value = photo.photo_month ?? "";
    editYear.value = photo.photo_year ?? "";
    editCaption.value = photo.caption || "";
    const image = document.getElementById("organizerImage");
    image.removeAttribute("src");
    const [urlResult, linksResult, tagsResult] = await Promise.all([
      db.storage.from(BUCKET).createSignedUrl(photo.storage_path, 3600),
      db.from("photo_tags").select("tag_id").eq("photo_id", photo.id),
      db.from("tags").select("id,name,category").order("name")
    ]);
    if (urlResult.error || linksResult.error || tagsResult.error) {
      organizerMessage.textContent = (urlResult.error || linksResult.error || tagsResult.error).message;
      return;
    }
    image.src = urlResult.data.signedUrl;
    const linked = new Set(linksResult.data.map(link => link.tag_id));
    editPeople.value = tagsResult.data.filter(tag => linked.has(tag.id) && tag.category === "person")
      .map(tag => tag.name).join(", ");
    editTags.value = tagsResult.data.filter(tag => linked.has(tag.id) && tag.category !== "person")
      .map(tag => tag.name).join(", ");
    for (const [listId, category] of [["knownPeople", "person"], ["knownTags", "other"]]) {
      const list = document.getElementById(listId);
      list.replaceChildren();
      tagsResult.data.filter(tag => tag.category === category).forEach(tag => {
        const option = document.createElement("option");
        option.value = tag.name;
        list.appendChild(option);
      });
    }
    organizerMessage.textContent = "";
    organizer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveCurrentPhoto(moveNext) {
    if (organizerBusy || currentPhotoIndex < 0) return;
    const photo = incompletePhotos[currentPhotoIndex];
    const month = editMonth.value ? Number(editMonth.value) : null;
    const year = editYear.value ? Number(editYear.value) : null;
    if ((month !== null && (month < 1 || month > 12)) ||
        (year !== null && (year < 1800 || year > 2200))) {
      organizerMessage.textContent = "Enter a valid month and year, or leave them blank.";
      return;
    }
    const wanted = [
      ...parseTags(editPeople.value).map(name => ({ name, category: "person" })),
      ...parseTags(editTags.value).map(name => ({ name, category: "other" }))
    ];
    const distinct = [...new Map(wanted.map(tag => [tag.name.toLocaleLowerCase(), tag])).values()];
    organizerBusy = true;
    saveButton.disabled = saveNextButton.disabled = deleteButton.disabled = true;
    organizerMessage.textContent = "Saving...";
    try {
      const tagIds = [];
      for (const tag of distinct) {
        let { data: existing, error } = await db.from("tags").select("id,category").eq("name", tag.name).maybeSingle();
        if (error) throw error;
        if (!existing) {
          const result = await db.from("tags").insert(tag).select("id,category").single();
          if (result.error) throw result.error;
          existing = result.data;
        }
        tagIds.push(existing.id);
      }
      const { data: oldLinks, error: oldError } = await db.from("photo_tags").select("tag_id").eq("photo_id", photo.id);
      if (oldError) throw oldError;
      const previous = new Set(oldLinks.map(link => link.tag_id));
      const desired = new Set(tagIds);
      const add = tagIds.filter(id => !previous.has(id)).map(tag_id => ({ photo_id: photo.id, tag_id }));
      if (add.length) {
        const { error } = await db.from("photo_tags").insert(add);
        if (error) throw error;
      }
      const remove = [...previous].filter(id => !desired.has(id));
      if (remove.length) {
        const { error } = await db.from("photo_tags").delete().eq("photo_id", photo.id).in("tag_id", remove);
        if (error) throw error;
      }
      const { error: photoError } = await db.from("photos").update({
        photo_month: month, photo_year: year,
        caption: editCaption.value.trim() || null,
        is_complete: distinct.length > 0
      }).eq("id", photo.id);
      if (photoError) throw photoError;
      const oldIndex = currentPhotoIndex;
      await loadPhotos();
      if (distinct.length || moveNext) {
        if (incompletePhotos.length) {
          await openOrganizer(Math.min(oldIndex + (distinct.length ? 0 : 1), incompletePhotos.length - 1));
        } else {
          organizer.hidden = true;
          currentPhotoIndex = -1;
          showSection("gallery");
        }
      } else {
        await openOrganizer(Math.min(oldIndex, incompletePhotos.length - 1));
      }
      organizerMessage.textContent = organizer.hidden ? "" : "Saved.";
    } catch (error) {
      organizerMessage.textContent = `Could not save: ${error.message}`;
    } finally {
      organizerBusy = false;
      saveButton.disabled = saveNextButton.disabled = deleteButton.disabled = false;
    }
  }

  saveButton.addEventListener("click", () => saveCurrentPhoto(false));
  saveNextButton.addEventListener("click", () => saveCurrentPhoto(true));
  document.getElementById("previousPhoto").addEventListener("click", () => openOrganizer(currentPhotoIndex - 1));
  document.getElementById("nextPhoto").addEventListener("click", () => openOrganizer(currentPhotoIndex + 1));
  document.getElementById("closeOrganizer").addEventListener("click", () => {
    organizer.hidden = true;
    currentPhotoIndex = -1;
  });
  deleteButton.addEventListener("click", async () => {
    if (!isPoster || organizerBusy || currentPhotoIndex < 0) return;
    const photo = incompletePhotos[currentPhotoIndex];
    if (!window.confirm(`Permanently delete ${photo.original_filename || "this photograph"}? This cannot be undone.`)) return;
    organizerBusy = true;
    deleteButton.disabled = true;
    organizerMessage.textContent = "Deleting...";
    // Remove the storage file first. If it fails, preserve the database record.
    const { error: storageError } = await db.storage.from(BUCKET).remove([photo.storage_path]);
    if (storageError) {
      organizerMessage.textContent = storageError.message;
      organizerBusy = false;
      deleteButton.disabled = false;
      return;
    }
    const { error } = await db.from("photos").delete().eq("id", photo.id);
    if (error) {
      organizerMessage.textContent = `File deleted, but its database record could not be removed: ${error.message}`;
    } else {
      const index = currentPhotoIndex;
      await loadPhotos();
      if (incompletePhotos.length) await openOrganizer(Math.min(index, incompletePhotos.length - 1));
      else { organizer.hidden = true; currentPhotoIndex = -1; }
    }
    organizerBusy = false;
    deleteButton.disabled = false;
  });

  signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;
    signOutButton.textContent = "Signing out...";
    await db.auth.signOut();
    window.location.replace("index.html");
  });
  checkGallerySession();
}
