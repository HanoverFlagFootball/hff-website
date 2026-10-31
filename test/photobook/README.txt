PHOTOBOOK v20 — LOW-EGRESS PILOT
================================
IMPORTANT: This version is a staged pilot. The JavaScript passes syntax checks,
but live Supabase, RLS, upload, and browser behaviour have NOT been tested here.
Back up the four existing website files before installing. Test on a staging
copy first. Do not run a mass thumbnail conversion during a quota problem.

STEP 1: Supabase > correct Photobook project > SQL Editor.
Copy and run SETUP_ONCE.sql. This adds a has_thumbnail boolean column, indexes,
and two authenticated read-only functions. It does NOT alter existing originals.
Confirm there are no SQL errors. Your current project URL is
https://puthhhnedurxircaglqe.supabase.co — verify the project in the dashboard.

STEP 2: Upload ONLY these four files to test/photobook/:
  index.html
  gallery.html
  photobook.css
  photobook.js
Do not upload README or SQL to your public website.

STEP 3: Test in a browser:
  - Login as Viewer and Poster; verify unauthorized accounts cannot see photos.
  - Gallery starts with only three random preview images.
  - Show Photos loads 40 at a time, then Load 40 More.
  - Manage Photos defaults to Incomplete, loads 20, then Load 20 More.
  - Upload a test image and check it has a tiny .thumb.webp companion file.
  - Tag/save, close organizer, confirm it disappears from Incomplete.
  - Test filters, full-screen viewer, previous/next, ZIP, deletion, tag manager.
  - Check DevTools > Network for image byte sizes; check Supabase usage.

PREVIEWS FOR EXISTING PHOTOS
  Existing photos have has_thumbnail=false. The app requests Supabase Storage
  image transformations (480x360 quality 65) instead of original bytes.
  Transformation availability depends on your Supabase plan/configuration.
  If transformed previews fail, the original is NOT silently downloaded for
  the grid. Use Manage Photos > Create Thumbnails for Loaded Photos, but ONLY
  when your egress quota can afford downloading those originals once. It
  processes at most 20 per click, never modifies originals, and writes small
  companion WebP images. It is optional and uses egress for the one-time job.
  For large backfills, schedule batches and measure usage after each batch.

BANDWIDTH / PRIVACY
  No original is downloaded for gallery or management grids. Originals are
  downloaded for full-screen viewing, Download Visible ZIP, and explicitly
  requested legacy thumbnail generation. ZIP now downloads ONLY the currently
  loaded visible gallery results (up to 40 per page plus loaded pages).
  Preview signed URLs are reused for up to 50 minutes within the open tab.
  Persistent cross-session private caching is deliberately NOT implemented:
  it needs shared-device/privacy controls and should be reviewed separately.
  Existing browser HTTP caching may still apply.

KNOWN LIMITATIONS
  - Legacy previews require supported Supabase image transformations or
    companion thumbnails; otherwise a preview may be blank.
  - "Fill Missing Dates" checks only the currently loaded 20-photo pages.
  - Tag usage counts are only for loaded photographs; deleting a tag affects
    all photographs with that tag, including unloaded ones.
  - Random sort in "Show Photos" returns one 40-photo page to avoid
    duplicate results from unstable random pagination.
  - Current application has Poster/Viewer roles; no new approval, tag merge,
    or grouped person-filter features were invented.
  - No persistent browser Cache API/IndexedDB storage is added.

ROLLBACK
  Restore your four previous files from backup. The added SQL functions,
  indexes, and has_thumbnail column are harmless if left in place. Do not
  delete original files or remove columns to roll back.
