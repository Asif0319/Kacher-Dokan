# V25 Homepage and Existing MongoDB Login Fix

- Restored the v23 homepage/dashboard markup and the exact previous theme image.
- Kept v24 profile, inventory, analytics, voice, payment, chat, and order-flow improvements.
- Fixed Spring Boot verification for legacy Node.js scrypt password hashes already in MongoDB Atlas.
- Kept compatibility with v23/v24 Spring-generated scrypt hashes and older plain-text/demo records.
- Email login is now case-insensitive for older records.
- No MongoDB reset or re-registration is required.
