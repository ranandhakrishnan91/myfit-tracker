MYFIT TRACKER — VERSION 1.3

FILES
- index.html
- style.css
- app.js
- themes.js
- manifest.json
- service-worker.js
- icon.svg
- icon-192.png
- icon-512.png
- README.txt

DEPLOYMENT
1. Export a JSON backup from your currently deployed MyFit Tracker before replacing files.
2. Extract this ZIP on your phone or computer.
3. Upload all 10 files to the ROOT of the same GitHub Pages repository, replacing files with matching names.
4. Commit the changes. GitHub Pages will deploy automatically.
5. Wait for the Pages deployment workflow to finish, then reopen the same app URL.
6. If an old screen remains cached, close the app and reopen it after a short wait. Do NOT clear site data; IndexedDB contains workout history.

DATA SAFETY
- The app keeps the existing IndexedDB database name `myfit-tracker-db` and existing `workouts` and `exerciseLibrary` stores.
- No database deletion or reset is performed.
- A successful IndexedDB transaction is required before the workout form is cleared.
- Keep your JSON backup in a safe place before deployment.

NEW IN 1.3
- Multi-select exercises within a category.
- Manual custom exercise/activity entry with selectable metric profile.
- Native date/time controls.
- Tappable workout history with full session details.
- Persistent Install App button with browser-specific fallback guidance.
- Swipeable, data-driven dashboard graph cards.
- MyFit Intelligence: mandatory date range (week, month, all time, custom), selectable analysis prompts, custom question, preview and Android share flow.
- Standardised uppercase MYFIT TRACKER branding and app icon.

NOTES
- AI analysis is prepared as a local report and shared through the device share sheet. No data is sent automatically and no AI API key is embedded.
- Excel export uses SheetJS from a CDN and therefore requires internet to load that library. JSON backup/restore is local.
- Install prompts depend on browser/platform support. The button remains visible and provides instructions where a direct prompt is unavailable.
- All workout data remains local to the browser/device. Sharing a report is always user-initiated.
