# Kacher Dokan v27 – Homepage/launcher repair

## What was repaired
- Corrected broken hero/background asset URL: `/assets/theme.jpg` -> `/images/theme.jpg` in both web and Spring static CSS.
- Added new frontend cache revision v27.
- macOS launch scripts now refuse to hijack an unrelated process on port 3000 and show the listener command. This matters if the browser shows a generic `Please sign in` page, which is NOT part of the packaged Kacher Dokan HTML.
- `kaser-dokan-web/RUN_MAC.command` now starts the same Spring backend launcher as the root scripts.

## Run on Mac
1. Extract the ZIP fully. Open Terminal.
2. `cd /path/to/Kacher-Dokan-v27-HOMEPAGE-STARTUP-FIX`
3. `bash RESTART_SPRING_MAC.command`
4. After Spring reports started, open `http://localhost:3000`.
5. If the launcher warns port 3000 occupied, stop the unrelated app OR run `cd kaser-dokan-backend && PORT=3001 mvn spring-boot:run` (after exporting your .env configuration) and open `http://localhost:3001`.
6. Verify the page title is `কাছের দোকান — Hyperlocal Grocery Discovery & Ordering`. A generic 'Please sign in' page means you are using another server.

## Scope / remaining limitations
- Performed source inspections and automated JavaScript parse checks; no live MongoDB/Cloudinary/payment gateway/voice integration test was possible here.
- `/api/tts` in the source still explicitly returns HTTP 502; browser speechSynthesis is the fallback and its Bangla voice availability varies by device. Do not consider Microsoft Edge TTS working in this build.
- No demo data or MongoDB credentials are bundled. End-to-end login/orders/payments/chat/delivery must be tested with your configured Atlas database.
