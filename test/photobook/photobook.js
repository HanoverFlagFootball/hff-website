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
  const el = id => document.getElementById(id);
  let isPoster = false;
  let galleryPhotos = [], incompletePhotos = [], allTags = [], links = {};
  let activeSection = "gallery", currentIndex = -1;
  let drafts = new Map(), hiddenIds = new Set(), carriedMonth = "", carriedYear = "";
  let saving = false, deleting = false, saveTimer = null, pickerInstances = {}, fillingForm = false;
  let managePhotos = [], selectedIds = new Set();
  let galleryMode = "random", galleryRenderVersion = 0;
  const BUCKET_LIMIT = 1000;
  const norm = s => s.trim().toLocaleLowerCase();
  const pending = () => el("pendingStatus").textContent = `${drafts.size} photo(s) waiting to save`;
  const currentList = () => activeSection === "manage" ? managePhotos : galleryPhotos;

  // Camera filenames such as 20230128_123456.jpg contain YYYYMMDD before '_'.
  // Validate the whole calendar date; never infer from a filename that does not match.
  function dateFromFilename(filename) {
    const match = /^(\d{4})(\d{2})(\d{2})_/.exec(filename || "");
    if (!match) return null;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    if (year < 1800 || year > 2200) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
    return { year, month };
  }


  // A picker displays existing options, supports typing and selecting many values.
  function picker(id, category, allowCreate, onChange) {
    const root = el(id), selected = new Map();
    const chips = document.createElement("div"), input = document.createElement("input"), suggestions = document.createElement("div");
    chips.className = "tag-chips"; suggestions.className = "tag-suggestions";
    input.placeholder = allowCreate ? "Search or add a tag" : "Search existing tags";
    root.replaceChildren(chips, input, suggestions);
    function choose(name) { selected.set(norm(name), name); input.value = ""; draw(); onChange?.(); }
    function draw() {
      chips.replaceChildren(); suggestions.replaceChildren();
      for (const [key, name] of selected) {
        const chip = document.createElement("span"); chip.className = "tag-chip";
        const label = document.createElement("span"); label.textContent = name;
        const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×";
        remove.setAttribute("aria-label", `Remove ${name}`);
        remove.onclick = () => { selected.delete(key); draw(); onChange?.(); };
        chip.append(label, remove); chips.append(chip);
      }
      const q = norm(input.value);
      const matches = allTags.filter(t => t.category === category && !selected.has(norm(t.name)) && norm(t.name).includes(q));
      for (const tag of matches) {
        const b = document.createElement("button"); b.type = "button"; b.textContent = tag.name;
        b.onclick = () => choose(tag.name); suggestions.append(b);
      }
      if (allowCreate && q && !allTags.some(t => norm(t.name) === q) && !selected.has(q)) {
        const b = document.createElement("button"); b.type = "button";
        b.textContent = `+ Create "${input.value.trim()}"`;
        b.onclick = () => choose(input.value.trim()); suggestions.prepend(b);
      }
    }
    input.addEventListener("input", draw);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const exact = allTags.find(t => t.category === category && norm(t.name) === norm(input.value));
        if (exact) choose(exact.name);
        else if (allowCreate && input.value.trim()) choose(input.value.trim());
      }
    });
    pickerInstances[id] = {
      get: () => [...selected.values()],
      set: values => { selected.clear(); for (const value of values) selected.set(norm(value), value); input.value = ""; draw(); },
      refresh: draw
    };
    draw();
  }

  function draftFor(photo) {
    const filenameDate = dateFromFilename(photo.original_filename);
    return drafts.get(photo.id) || {
      month: photo.photo_month == null ? (filenameDate ? String(filenameDate.month) : carriedMonth) : String(photo.photo_month),
      year: photo.photo_year == null ? (filenameDate ? String(filenameDate.year) : carriedYear) : String(photo.photo_year),
      caption: photo.caption || "",
      people: (links[photo.id] || []).filter(t => t.category === "person").map(t => t.name),
      theme: (links[photo.id] || []).filter(t => t.category === "theme").map(t => t.name),
      other: (links[photo.id] || []).filter(t => t.category === "other").map(t => t.name)
    };
  }
  function captureDraft() {
    const photo = currentList()[currentIndex];
    if (fillingForm || !photo || !isPoster || el("organizer").hidden) return;
    const data = {
      month: el("editMonth").value, year: el("editYear").value.trim(),
      caption: el("editCaption").value,
      people: pickerInstances.editPeople.get(), theme: pickerInstances.editTheme.get(), other: pickerInstances.editTags.get()
    };
    carriedMonth = data.month; carriedYear = data.year;
    const previous = draftFor(photo);
    // Only mark a photo pending if values differ from its last loaded/saved state.
    const baseline = {
      month: photo.photo_month == null ? "" : String(photo.photo_month),
      year: photo.photo_year == null ? "" : String(photo.photo_year),
      caption: photo.caption || "",
      people: (links[photo.id] || []).filter(t => t.category === "person").map(t => t.name),
      theme: (links[photo.id] || []).filter(t => t.category === "theme").map(t => t.name),
      other: (links[photo.id] || []).filter(t => t.category === "other").map(t => t.name)
    };
    const same = JSON.stringify(data) === JSON.stringify(baseline);
    if (same) drafts.delete(photo.id); else drafts.set(photo.id, data);
    pending();
    if (!same) scheduleSave();
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveAll(false), 12000);
  }

  async function signedImage(path) {
    const { data, error } = await db.storage.from(BUCKET).createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  }
  async function loadData() {
    el("galleryMessage").textContent = "Loading photographs...";
    async function fetchAll(table, select, filters = fn => fn) {
      let rows = [];
      for (let offset = 0; ; offset += BUCKET_LIMIT) {
        let query = db.from(table).select(select).range(offset, offset + BUCKET_LIMIT - 1);
        query = filters(query);
        const { data, error } = await query;
        if (error) throw error;
        rows.push(...data);
        if (data.length < BUCKET_LIMIT) return rows;
      }
    }
    try {
      const [photos, tags, relations] = await Promise.all([
        fetchAll("photos", "id,storage_path,photo_month,photo_year,caption,original_filename,is_complete,created_at", q => q.order("created_at", {ascending:false})),
        fetchAll("tags", "id,name,category", q => q.order("name")),
        fetchAll("photo_tags", "photo_id,tag_id")
      ]);
      allTags = tags; links = {};
      const tagMap = new Map(tags.map(t => [t.id, t]));
      for (const link of relations) {
        const tag = tagMap.get(link.tag_id);
        if (tag) (links[link.photo_id] ||= []).push(tag);
      }
      galleryPhotos = photos;
      incompletePhotos = isPoster ? photos.filter(p => !p.is_complete) : [];
      managePhotos = isPoster ? [...photos] : [];
      selectedIds = new Set([...selectedIds].filter(id => managePhotos.some(p => p.id === id)));
      el("incompleteCount").textContent = `(${incompletePhotos.length})`;
      const years = [...new Set(galleryPhotos.map(p => p.photo_year).filter(Boolean))].sort((a,b) => b-a);
      const priorYear = el("filterYear").value;
      el("filterYear").replaceChildren(new Option("Any year", ""), ...years.map(y => new Option(String(y), String(y))));
      el("filterYear").value = priorYear;
      Object.values(pickerInstances).forEach(p => p.refresh());
      renderTagManager();
      await renderGallery();
      el("galleryMessage").textContent = "";
    } catch (error) { el("galleryMessage").textContent = `Could not load photographs: ${error.message}`; }
  }
  function matchingGallery() {
    const people = pickerInstances.filterPeople.get().map(norm);
    const theme = pickerInstances.filterTheme.get().map(norm);
    const other = pickerInstances.filterOther.get().map(norm);
    const year = el("filterYear").value, month = el("filterMonth").value;
    return galleryPhotos.filter(p => {
      if (hiddenIds.has(p.id)) return false;
      if (year && String(p.photo_year) !== year) return false;
      if (month && String(p.photo_month) !== month) return false;
      const ts = links[p.id] || [];
      const has = (category, name) => ts.some(t => t.category === category && norm(t.name) === name);
      if (people.length && !(el("peopleMode").value === "and" ? people.every(n => has("person",n)) : people.some(n => has("person",n)))) return false;
      return theme.every(n => has("theme",n)) && other.every(n => has("other",n));
    });
  }
  async function renderTiles(rows, target, editable) {
    target.replaceChildren();
    if (!rows.length) { const p = document.createElement("p"); p.className="empty-gallery"; p.textContent="No photographs match."; target.append(p); return; }
    const figures = rows.map(photo => {
      const figure = document.createElement("figure"); figure.className="photo-tile";
      const img = document.createElement("img"); img.loading="lazy"; img.alt=photo.caption || "Family photograph";
      // Metadata appears over the photograph on hover, focus, or touch.
      const tags = links[photo.id] || [];
      const byCategory = category => tags.filter(t => t.category === category).map(t => t.name).join(", ");
      const details = document.createElement("figcaption");
      details.className = "photo-details";
      const lines = [
        ["Who", byCategory("person")],
        ["When", photo.photo_month && photo.photo_year
          ? new Date(Date.UTC(photo.photo_year, photo.photo_month - 1, 1)).toLocaleString("en-CA", {month:"long",year:"numeric",timeZone:"UTC"})
          : (photo.photo_year ? String(photo.photo_year) : "")],
        ["Theme", byCategory("theme")],
        ["Event", byCategory("other")],
        ["Caption", photo.caption || ""]
      ];
      for (const [label,value] of lines) {
        if (!value) continue;
        const line = document.createElement("div");
        const heading = document.createElement("strong"); heading.textContent = `${label}: `;
        line.append(heading, document.createTextNode(value));
        details.append(line);
      }
      if (!details.childNodes.length) details.textContent = "No details added yet";
      figure.append(img, details);
      if (!editable) {
        // The preview is a thumbnail, but the viewer uses the original stored file.
        img.tabIndex = 0;
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", "View photograph at original resolution");
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => openFullPhoto(photo));
        img.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFullPhoto(photo);
          }
        });
      }
      if (editable) {
        const choose = document.createElement("input"); choose.type="checkbox";
        choose.className="photo-select"; choose.checked=selectedIds.has(photo.id);
        choose.setAttribute("aria-label", "Select photograph for bulk deletion");
        choose.onclick=e=>e.stopPropagation();
        choose.onchange=()=>{if(choose.checked)selectedIds.add(photo.id);else selectedIds.delete(photo.id);updateSelection();};
        figure.append(choose);
        figure.classList.add("editable-tile"); figure.tabIndex=0; figure.setAttribute("role","button");
        const open = () => openOrganizer(managePhotos.findIndex(p => p.id === photo.id));
        figure.onclick=open; figure.onkeydown=e => { if (e.key === "Enter" || e.key === " ") {e.preventDefault();open();} };
      } else {
        const hide = document.createElement("button"); hide.type="button"; hide.className="hide-photo"; hide.textContent="×";
        hide.title="Temporarily hide from these results"; hide.setAttribute("aria-label", "Hide photograph");
        hide.onclick=() => {hiddenIds.add(photo.id); renderGallery();}; figure.append(hide);
      }
      target.append(figure);
      return {photo,img};
    });
    // Fetch signed URLs concurrently rather than waiting for each image sequentially.
    await Promise.all(figures.map(async ({photo,img}) => {
      try { img.src = await signedImage(photo.storage_path); } catch { img.alt = "Preview unavailable"; }
    }));
  }
  // Full-resolution viewer. The file is requested from private Supabase Storage
  // only after a photo is clicked, not for every gallery thumbnail.
  async function openFullPhoto(photo) {
    const viewer = el("fullPhotoViewer");
    const image = el("fullPhotoImage");
    const status = el("fullPhotoStatus");
    const originalLink = el("fullPhotoOriginal");
    image.removeAttribute("src");
    image.alt = photo.caption || "Full-resolution family photograph";
    status.textContent = "Loading original photograph...";
    originalLink.hidden = true;
    viewer.hidden = false;
    document.body.classList.add("photo-viewer-open");
    try {
      const url = await signedImage(photo.storage_path);
      if (viewer.hidden) return;
      image.src = url;
      originalLink.href = url;
      originalLink.hidden = false;
      status.textContent = "";
    } catch (error) {
      status.textContent = `Unable to load original: ${error.message}`;
    }
  }
  function closeFullPhoto() {
    el("fullPhotoViewer").hidden = true;
    el("fullPhotoImage").removeAttribute("src");
    document.body.classList.remove("photo-viewer-open");
  }
  el("closeFullPhoto").onclick = closeFullPhoto;
  el("fullPhotoViewer").addEventListener("click", event => {
    if (event.target === el("fullPhotoViewer")) closeFullPhoto();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !el("fullPhotoViewer").hidden) closeFullPhoto();
  });

  function sortedPhotos(rows) {
    const result = [...rows];
    const mode = el("sortPhotos").value;
    if (mode === "random") {
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    } else if (mode === "oldest") result.reverse();
    else if (mode === "dateNewest" || mode === "dateOldest") {
      const dateKey = p => p.photo_year && p.photo_month ? p.photo_year * 12 + p.photo_month : -1;
      result.sort((a,b) => mode === "dateNewest" ? dateKey(b)-dateKey(a) : dateKey(a)-dateKey(b));
    }
    return result;
  }
  async function renderGallery() {
    const version = ++galleryRenderVersion;
    const matches = matchingGallery();
    const visible = galleryMode === "random"
      ? (() => {
          const choices = [...matches];
          for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
          }
          return choices.slice(0, 3);
        })()
      : sortedPhotos(matches);
    el("filterStatus").textContent = galleryMode === "random"
      ? (visible.length ? "Three random photographs. Choose filters and click Show Photos for matching results." : "No photographs available.")
      : `${visible.length} matching photograph(s) · ${hiddenIds.size} temporarily hidden`;
    // Only request image URLs for the displayed set, not every photo on initial load.
    await renderTiles(visible, el("photoGallery"), false);
    if (version !== galleryRenderVersion) return;
    if (isPoster && activeSection === "manage") {
      await renderTiles(manageVisible(), el("incompleteGallery"), true);
      updateSelection();
    }
  }
  function renderTagManager() {
    if (!isPoster) return;
    const category = el("tagManageCategory").value;
    const query = norm(el("tagManageSearch").value);
    const root = el("tagManageList"); root.replaceChildren();
    const tags = allTags.filter(t => t.category === category && norm(t.name).includes(query))
      .sort((a,b) => a.name.localeCompare(b.name));
    if (!tags.length) {root.textContent = "No matching tags."; return;}
    for (const tag of tags) {
      const row = document.createElement("div"); row.className = "tag-manage-row";
      const count = Object.values(links).filter(list => list.some(t => t.id === tag.id)).length;
      const name = document.createElement("span"); name.textContent = `${tag.name} (${count} photos)`;
      const button = document.createElement("button"); button.type = "button";
      button.className = "danger"; button.textContent = "Delete tag";
      button.onclick = async () => {
        if (saving || deleting || drafts.size) {
          el("tagManageMessage").textContent = "Save pending photo changes before deleting tags.";
          return;
        }
        if (!confirm(`Delete the tag "${tag.name}"?\n\nIt will be removed from ${count} photograph(s). The photographs themselves will NOT be deleted.`)) return;
        button.disabled = true;
        const { error } = await db.from("tags").delete().eq("id", tag.id);
        if (error) {button.disabled = false; el("tagManageMessage").textContent = `Could not delete tag: ${error.message}`; return;}
        allTags = allTags.filter(t => t.id !== tag.id);
        for (const id of Object.keys(links)) links[id] = links[id].filter(t => t.id !== tag.id);
        Object.values(pickerInstances).forEach(p => {p.set(p.get().filter(name => norm(name) !== norm(tag.name))); p.refresh();});
        el("tagManageMessage").textContent = `Deleted tag "${tag.name}". Photographs were kept.`;
        renderTagManager();
        await renderGallery();
      };
      row.append(name,button);root.append(row);
    }
  }
  function manageVisible() {
    const view=el("manageView").value;
    return managePhotos.filter(p=>view==="all" || (view==="complete" ? p.is_complete : !p.is_complete));
  }
  function updateSelection() {
    const visible=manageVisible();
    el("selectedCount").textContent=`${selectedIds.size} selected`;
    el("deleteSelected").disabled=deleting || saving || selectedIds.size===0;
    el("selectAllPhotos").checked=visible.length>0 && visible.every(p=>selectedIds.has(p.id));
    el("selectAllPhotos").indeterminate=visible.some(p=>selectedIds.has(p.id)) && !visible.every(p=>selectedIds.has(p.id));
  }
  function showSection(section) {
    activeSection=section;
    const incomplete=section==="manage" && isPoster;
    el("incompleteSection").hidden=!incomplete;
    el("photoGallery").hidden=incomplete;
    el("filterPanel").hidden=incomplete;
    el("galleryTab").classList.toggle("active",!incomplete);
    el("incompleteTab").classList.toggle("active",incomplete);
    el("organizer").hidden=true; currentIndex=-1;
    if(incomplete){updateSelection();renderTiles(manageVisible(),el("incompleteGallery"),true);renderTagManager();}
  }
  function openOrganizer(index) {
    if (!isPoster || index<0 || index>=managePhotos.length) return;
    if (currentIndex>=0) captureDraft();
    currentIndex=index;
    const photo=managePhotos[index], d=draftFor(photo);
    el("organizer").hidden=false;
    el("organizerPosition").textContent=`Photo ${index+1} of ${managePhotos.length}`;
    fillingForm=true;
    el("editMonth").value=d.month; el("editYear").value=d.year; el("editCaption").value=d.caption;
    const filenameDate = dateFromFilename(photo.original_filename);
    el("filenameDateNote").textContent = filenameDate
      ? `Date detected from original filename: ${filenameDate.year}-${String(filenameDate.month).padStart(2,"0")}. You can change it.`
      : "No valid date found in filename. You can enter a date or use the previous photo's date.";
    pickerInstances.editPeople.set(d.people); pickerInstances.editTheme.set(d.theme); pickerInstances.editTags.set(d.other);
    fillingForm=false;
    el("organizerMessage").textContent="";
    const image=el("organizerImage"); image.removeAttribute("src");
    const id=photo.id;
    signedImage(photo.storage_path).then(url => {if(currentList()[currentIndex]?.id===id) image.src=url;}).catch(e => el("organizerMessage").textContent=e.message);
    pending();
    el("organizer").scrollIntoView({block:"start",behavior:"instant"});
  }
  async function saveOne(id, d) {
    const year=d.year ? Number(d.year) : null, month=d.month ? Number(d.month) : null;
    if ((year!==null && (!Number.isInteger(year)||year<1800||year>2200)) || (month!==null && (month<1||month>12))) throw Error("Invalid month/year");
    const selected=[...d.people.map(name=>({name,category:"person"})),...d.theme.map(name=>({name,category:"theme"})),...d.other.map(name=>({name,category:"other"}))];
    const ids=[];
    for(const tag of selected) {
      let existing=allTags.find(t=>norm(t.name)===norm(tag.name));
      if(existing && existing.category!==tag.category) throw Error(`"${tag.name}" already exists under ${existing.category}. Use a different name.`);
      if(!existing) {
        const {data,error}=await db.from("tags").insert(tag).select("id,name,category").single();
        if(error) throw error; existing=data; allTags.push(existing);
      }
      ids.push(existing.id);
    }
    const {data:old,error:readError}=await db.from("photo_tags").select("tag_id").eq("photo_id",id);
    if(readError) throw readError;
    const previous=new Set(old.map(t=>t.tag_id)), desired=new Set(ids);
    const add=[...desired].filter(x=>!previous.has(x)).map(tag_id=>({photo_id:id,tag_id}));
    const remove=[...previous].filter(x=>!desired.has(x));
    if(add.length){const {error}=await db.from("photo_tags").insert(add);if(error)throw error;}
    if(remove.length){const {error}=await db.from("photo_tags").delete().eq("photo_id",id).in("tag_id",remove);if(error)throw error;}
    const {error}=await db.from("photos").update({photo_month:month,photo_year:year,caption:d.caption.trim()||null,is_complete:ids.length>0}).eq("id",id);
    if(error)throw error;
    const photo=galleryPhotos.find(p=>p.id===id);
    if(photo){photo.photo_month=month;photo.photo_year=year;photo.caption=d.caption.trim();photo.is_complete=ids.length>0;}
    links[id]=ids.map(x=>allTags.find(t=>t.id===x)).filter(Boolean);
  }
  async function saveAll(manual=true) {
    if(saving || !drafts.size) return;
    saving=true; clearTimeout(saveTimer);
    el("savePhoto").disabled=true;
    let saved=0, failures=[];
    const entries=[...drafts.entries()];
    for(const [id,d] of entries) {
      try {await saveOne(id,d); if(drafts.get(id)===d) drafts.delete(id); saved++;}
      catch(e){failures.push(`${id.slice(0,8)}: ${e.message}`);}
      pending();
    }
    const currentId=managePhotos[currentIndex]?.id;
    galleryPhotos=[...managePhotos];
    incompletePhotos=managePhotos.filter(p=>!p.is_complete);
    el("incompleteCount").textContent=`(${incompletePhotos.length} incomplete)`;
    saving=false; el("savePhoto").disabled=false;
    el("organizerMessage").textContent=failures.length ? `Saved ${saved}; ${failures.length} failed: ${failures.join("; ")}` : `Saved ${saved} photograph(s).`;
    if(currentId && !el("organizer").hidden) {
      const n=managePhotos.findIndex(p=>p.id===currentId);
      currentIndex=-1; if(n>=0)openOrganizer(n);
    }
    await renderGallery(); updateSelection(); renderTagManager();
    if(drafts.size) scheduleSave();
  }
  // Bulk upload does not ask for month, year or tags.
  el("submitPhotos").onclick=async()=>{
    if(!isPoster)return;
    const files=[...el("photoFiles").files], message=el("uploadMessage");
    if(!files.length){message.textContent="Select photographs first.";return;}
    el("submitPhotos").disabled=true;let count=0;const errors=[];
    for(const [i,file] of files.entries()) {
      message.textContent=`Uploading ${i+1} of ${files.length}...`;
      if(!file.type.startsWith("image/")){errors.push(`${file.name}: not an image`);continue;}
      const path=`${crypto.randomUUID()}/${crypto.randomUUID()}`;
      const {error:uploadError}=await db.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});
      if(uploadError){errors.push(`${file.name}: ${uploadError.message}`);continue;}
      const filenameDate = dateFromFilename(file.name);
      const {error}=await db.from("photos").insert({storage_path:path,original_filename:file.name,
        photo_month:filenameDate?.month ?? null,photo_year:filenameDate?.year ?? null,is_complete:false});
      if(error){await db.storage.from(BUCKET).remove([path]);errors.push(`${file.name}: ${error.message}`);}else count++;
    }
    message.textContent=`${count} uploaded.`+(errors.length?` Errors: ${errors.join("; ")}`:"");
    el("submitPhotos").disabled=false;
    if(count){el("photoFiles").value="";await loadData();showSection("manage");}
  };
  // One-time repair for already-uploaded photos. Never overwrite saved dates or pending edits.
  el("fillMissingDates").onclick = async () => {
    if (!isPoster || saving || deleting) return;
    const eligible = managePhotos.map(photo => ({photo, date:dateFromFilename(photo.original_filename)}))
      .filter(({photo,date}) => date && photo.photo_month == null && photo.photo_year == null && !drafts.has(photo.id));
    const message = el("manageMessage");
    if (!eligible.length) {message.textContent = "No photographs with missing dates and valid filename dates found.";return;}
    if (!confirm(`Fill dates from filenames for ${eligible.length} photograph(s)? Existing dates and unsaved edits will not be changed.`)) return;
    const button = el("fillMissingDates"); button.disabled = true;
    let updated=0; const failures=[];
    for (const {photo,date} of eligible) {
      const {error} = await db.from("photos").update({photo_month:date.month,photo_year:date.year})
        .eq("id",photo.id).is("photo_month",null).is("photo_year",null);
      if (error) failures.push(`${photo.original_filename}: ${error.message}`);
      else {photo.photo_month=date.month;photo.photo_year=date.year;updated++;}
    }
    button.disabled=false;
    message.textContent=`Filled ${updated} missing date(s).` + (failures.length ? ` Errors: ${failures.join("; ")}` : "");
    await renderGallery();
  };

  // Delete originals from private Storage first, then remove metadata. A failure is reported,
  // not silently treated as a success. Database cascades remove photo_tags associations.
  async function deletePhotos(ids) {
    if(deleting || saving || !isPoster || !ids.length)return;
    const photos=ids.map(id=>managePhotos.find(p=>p.id===id)).filter(Boolean);
    if(!photos.length)return;
    if(!confirm(`PERMANENTLY DELETE ${photos.length} photograph(s)?\n\nThis removes the original files and cannot be undone.`))return;
    deleting=true;updateSelection();
    el("deletePhoto").disabled=true;
    const errors=[];let removed=0;
    const activeId=managePhotos[currentIndex]?.id;
    for(const [i,photo] of photos.entries()) {
      el("manageMessage").textContent=`Deleting ${i+1} of ${photos.length}...`;
      try {
        const {error:storageError}=await db.storage.from(BUCKET).remove([photo.storage_path]);
        if(storageError)throw storageError;
        const {error}=await db.from("photos").delete().eq("id",photo.id);
        if(error)throw error;
        drafts.delete(photo.id);selectedIds.delete(photo.id);hiddenIds.delete(photo.id);
        managePhotos=managePhotos.filter(p=>p.id!==photo.id);
        removed++;
      }catch(e){errors.push(`${photo.original_filename || photo.id}: ${e.message}`);}
    }
    galleryPhotos=[...managePhotos];
    incompletePhotos=managePhotos.filter(p=>!p.is_complete);
    el("incompleteCount").textContent=`(${incompletePhotos.length} incomplete)`;
    const next=managePhotos.findIndex(p=>p.id===activeId);
    if(next<0){el("organizer").hidden=true;currentIndex=-1;}
    else currentIndex=next;
    deleting=false;el("deletePhoto").disabled=false;
    el("manageMessage").textContent=`Deleted ${removed} of ${photos.length} photograph(s).` + (errors.length ? ` Errors: ${errors.join("; ")}` : "");
    await renderGallery();updateSelection();pending();
  }
  el("deletePhoto").onclick=()=>{
    if(currentIndex>=0)deletePhotos([managePhotos[currentIndex].id]);
  };
  el("deleteSelected").onclick=()=>deletePhotos([...selectedIds]);
  el("manageView").onchange=()=>{selectedIds.clear();renderTiles(manageVisible(),el("incompleteGallery"),true);updateSelection();};
  el("selectAllPhotos").onchange=e=>{
    for(const p of manageVisible()) {if(e.target.checked)selectedIds.add(p.id);else selectedIds.delete(p.id);}
    renderTiles(manageVisible(),el("incompleteGallery"),true);updateSelection();
  };
  el("downloadVisible").onclick=async()=>{
    const rows=matchingGallery();
    if(!rows.length){el("filterStatus").textContent="No visible photographs to download.";return;}
    if(!window.JSZip){el("filterStatus").textContent="ZIP library unavailable. Try refreshing.";return;}
    const btn=el("downloadVisible");btn.disabled=true;
    const zip=new JSZip();let done=0;const failures=[];
    for(const photo of rows) {
      try {
        const {data,error}=await db.storage.from(BUCKET).download(photo.storage_path);
        if(error)throw error;
        const original=photo.original_filename || "photograph.jpg";
        const safe=original.replace(/[\\/:*?"<>|]/g,"_");
        zip.file(`${String(done+1).padStart(4,"0")}_${photo.id.slice(0,8)}_${safe}`,data);
        done++;
      }catch(e){failures.push(photo.original_filename||photo.id);}
      el("filterStatus").textContent=`Preparing originals ${done+failures.length} of ${rows.length}...`;
    }
    if(done){
      try{
        const blob=await zip.generateAsync({type:"blob",compression:"STORE"});
        const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="family-photobook-selection.zip";a.click();
        setTimeout(()=>URL.revokeObjectURL(url),60000);
      }catch(e){el("filterStatus").textContent=`Could not build ZIP: ${e.message}`;btn.disabled=false;return;}
    }
    el("filterStatus").textContent=`${done} originals downloaded${failures.length?`; ${failures.length} failed (${failures.join(", ")})`:""}.`;
    btn.disabled=false;
  };
  el("galleryTab").onclick=()=>{if(currentIndex>=0)captureDraft();showSection("gallery");};
  el("incompleteTab").onclick=()=>{if(currentIndex>=0)captureDraft();showSection("manage");};
  el("uploadButton").onclick=()=>el("uploadPanel").hidden=!el("uploadPanel").hidden;
  el("previousPhoto").onclick=()=>openOrganizer(currentIndex-1);
  el("nextPhoto").onclick=()=>openOrganizer(currentIndex+1);
  el("closeOrganizer").onclick=()=>{captureDraft();el("organizer").hidden=true;currentIndex=-1;};
  el("savePhoto").onclick=()=>{captureDraft();saveAll();};
  el("showPhotos").onclick = () => {galleryMode = "results"; renderGallery();};
  el("showRandom").onclick = () => {galleryMode = "random"; renderGallery();};
  el("sortPhotos").onchange = () => {if (galleryMode === "results") renderGallery();};
  el("tagManageCategory").onchange = renderTagManager;
  el("tagManageSearch").oninput = renderTagManager;
  el("clearFilters").onclick=()=>{
    ["filterPeople","filterTheme","filterOther"].forEach(id=>pickerInstances[id].set([]));
    el("filterYear").value="";el("filterMonth").value="";el("peopleMode").value="or";galleryMode="random";renderGallery();
  };
  el("restoreHidden").onclick=()=>{hiddenIds.clear();renderGallery();};
  ["filterYear","filterMonth","peopleMode"].forEach(id=>el(id).onchange=()=>{el("filterStatus").textContent="Filters changed. Click Show Photos to apply.";});
  ["filterPeople","filterTheme","filterOther"].forEach((id,i)=>picker(id,["person","theme","other"][i],false,()=>{el("filterStatus").textContent="Filters changed. Click Show Photos to apply.";}));
  ["editPeople","editTheme","editTags"].forEach((id,i)=>picker(id,["person","theme","other"][i],true,()=>{captureDraft();}));
  ["editMonth","editYear","editCaption"].forEach(id=>el(id).addEventListener("input",captureDraft));
  window.addEventListener("beforeunload",e=>{if(drafts.size){e.preventDefault();e.returnValue="";}});
  signOutButton.onclick=async()=>{
    if(drafts.size && !confirm("You have unsaved photo edits. Sign out anyway?"))return;
    await db.auth.signOut();location.replace("index.html");
  };
  (async()=>{
    const {data,error}=await db.auth.getUser();
    if(error||!data.user){location.replace("index.html");return;}
    const {data:membership,error:memberError}=await db.from("photobook_members").select("role").eq("user_id",data.user.id).single();
    if(memberError||!membership){await db.auth.signOut();location.replace("index.html");return;}
    isPoster=membership.role==="poster";
    el("accountStatus").textContent=isPoster?"Poster":"Viewer";
    el("uploadButton").hidden=!isPoster;el("incompleteTab").hidden=!isPoster;
    await loadData();showSection("gallery");
  })();
}
