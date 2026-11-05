MYFIT TRACKER — MOBILE SETUP

WHAT'S INCLUDED
- Mobile-friendly workout entry with date, gym in/out times and body weight
- Add/remove exercises and sets
- IndexedDB local storage (records stay in this browser on this device)
- Workout history
- JSON backup and restore (restore merges records and skips matching IDs)
- Excel export (.xlsx) with Workout Summary and Exercise Details sheets
- PWA shell caching for offline use after the app has been opened online

IMPORTANT
1. Host this project on HTTPS (GitHub Pages is suitable). Do not open index.html directly from the phone's Downloads folder; browser storage and PWA features may not work correctly from file://.
2. Excel export uses the SheetJS library from jsDelivr. Connect to the internet when exporting. The workout entry and local JSON backup/restore do not need the Excel library.
3. Workout data is stored only in this browser on this device. Clearing Chrome site data can erase it. Download JSON backups regularly and store them somewhere safe.
4. A JSON backup contains your workout records. Keep it private.

PUBLISH USING GITHUB ON YOUR PHONE
1. Sign in at github.com in Chrome.
2. Create a new public repository named myfit-tracker.
3. Open the repository and choose Add file > Upload files.
4. Extract this ZIP first using your phone's Files app. Upload all files inside the myfit-tracker folder (index.html, style.css, app.js, etc.) to the repository root. Do not upload only the ZIP.
5. Commit the files.
6. In the repository, open Settings > Pages.
7. Under Build and deployment, choose Deploy from a branch. Select branch main and folder /(root), then Save.
8. Wait for GitHub Pages to publish. Open the URL shown on the Pages screen.
9. In Chrome, use the menu (three dots) > Add to Home screen / Install app.

FIRST USE
- Add date, in time, out time, optional body weight.
- Add an exercise name, category, optional duration, and sets with reps/weight.
- Tap Save workout.
- Use Backup & export to download JSON backup or Excel workbook.

RESTORE BEHAVIOUR
- Uploading a MyFit JSON backup merges records into the current device.
- Records with an ID already present are skipped, avoiding duplicates.
- Restore does not erase current records.

VERSION
1.0
