# V26 Restart + Existing MongoDB Login Fix

This build fixes the situation where an older Java process was already listening on port 3000, causing the browser to keep showing the previous build.

## Mac
Double-click `RESTART_SPRING_MAC.command`. It stops the old port-3000 process, loads `kaser-dokan-backend/.env`, and starts the current Spring Boot project.

Do not run `npm start` inside `kaser-dokan-web`; the web frontend is served by Spring Boot.

## Login compatibility
- Node.js scrypt accounts
- previous Spring scrypt accounts
- legacy plaintext/demo records (upgraded to scrypt after successful login)
- role aliases such as SELLER -> SHOP_OWNER and CUSTOMER -> USER
- the role selected in the login dialog no longer blocks a valid database account; the role stored in MongoDB is authoritative.

## Browser
After restart, open `http://localhost:3000` and hard refresh once (Cmd+Shift+R on Mac). Static assets use cache-busting and no-store during the project demo.
