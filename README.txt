MYFIT TRACKER — v1.2

FILES
- index.html: app structure and four-section bottom navigation
- style.css: mobile-first boxed UI, larger fonts and tactile raised controls
- app.js: workout entry, exercise-specific metrics, local database, history, JSON backup/restore and Excel export
- themes.js: separate theme configuration (Classic, Hulk, Spider-Man, Iron Man, Batman, WWE)
- manifest.json, service-worker.js, icon.svg: installable web app support

DEPLOYMENT
1. First open your existing MyFit Tracker v1.1 app and download a fresh JSON backup from Settings after deploying, or use the existing Backup & Export screen before replacing files.
2. Extract this ZIP.
3. Upload all 8 files into the ROOT of the SAME GitHub repository, replacing files with identical names and adding themes.js if it is not present.
4. Commit the changes.
5. Open the same GitHub Pages URL. Close the old app tab and reopen it. If the old shell remains, fully close Chrome and reopen the URL; do NOT clear site data.

DATA PRESERVATION
The app deliberately retains IndexedDB database name "myfit-tracker-db", workout store "workouts", and exercise library store "exerciseLibrary". Existing workout records are not deleted or reset. Do not clear browser/site storage. JSON restore merges records and skips duplicate IDs.

FEATURES
- Home, Workout, History and Settings bottom navigation
- Exercise-specific inputs: treadmill (duration, speed, incline); elliptical (duration, resistance, distance); other cardio (duration, distance, average speed); strength (sets, reps, weight); timed holds (seconds)
- Category and exercise selectors; custom exercises saved to the local exercise library
- Theme picker and persistent local theme preference
- Dashboard summary, recent activity and simple consecutive-day streak indicator
- JSON backup/restore and Excel export
- Local-first storage; no login, cloud database, central data collection or gym selector

NOTES
- Workout data stays in this browser on this device. It is not automatically synced across devices.
- Excel export loads SheetJS from a CDN and therefore needs internet access when the library is not cached.
- The app shell is cached for reopening, but first install and initial asset loading require internet.
- Themes use original colour palettes and generic emoji symbols; they are not official character artwork or licensed brand assets.
