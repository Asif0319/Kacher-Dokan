# Download and run Kacher Dokan

This guide runs the Spring Boot backend and web UI with synthetic demo data. No live database credentials or real customer records are included.

## 1. Requirements

Install Java JDK 21, Apache Maven, MongoDB Community Server and MongoDB Shell (`mongosh`). Start the MongoDB service. Verify these commands in a new terminal:

```powershell
java -version
mvn -version
mongosh --version
```

Download/extract this repository, or clone it:

```powershell
git clone https://github.com/Asif0319/Kacher-Dokan.git
cd Kacher-Dokan
```

Run all commands below from this project folder unless a different directory is specified.

## 2. Create the demo database

```powershell
mongosh "mongodb://127.0.0.1:27017" --file demo/seed.mongosh.js
```

The script writes only to `kaser_dokan_demo`. It adds missing demo records without deleting collections or resetting existing stock, passwords or orders. Running it again does not duplicate records. It contains no pre-existing orders or payments; create those through checkout.

For Atlas, use your own connection URI in place of the localhost URI. Give that database user access to `kaser_dokan_demo`. Keep your URI private and URL-encode special characters in the password.

## 3. Configure and start the backend + web

Create `kaser-dokan-backend/.env` with this local configuration:

```dotenv
PORT=3000
DB_NAME=kaser_dokan_demo
MONGO_URI=mongodb://127.0.0.1:27017/kaser_dokan_demo
AUTH_SECRET=replace-with-your-own-long-random-secret
PAYMENT_MODE=demo
CLOUDINARY_URL=
PUBLIC_BASE_URL=
```

Replace `AUTH_SECRET` with your own value. For Atlas, replace `MONGO_URI` with your connection URI and keep `DB_NAME=kaser_dokan_demo`. Leave Cloudinary empty to use local image uploads.

```powershell
cd kaser-dokan-backend
mvn spring-boot:run
```

Keep that terminal open and visit **http://localhost:3000**. Spring Boot serves the web UI; a separate web server or `npm install` in `kaser-dokan-web` is unnecessary.

If port 3000 is occupied, use this instead, then open http://localhost:3080:

```powershell
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=3080"
```

## 4. Demo logins

All demo passwords are **123456**. Choose the matching account type on the login screen.

| Account type | Email |
|---|---|
| Customer | customer@example.com |
| Seller | seller@example.com |
| Second seller | seller2@example.com |
| Rider | rider@example.com |

Names, emails, phone numbers and shop records are fictional test data. The demo shops are near coordinates `23.8103, 90.4125` in Dhaka. Use that area when testing nearby search. Browser location elsewhere can put the shops outside the search radius.

Use separate browsers or browser profiles for simultaneous customer, seller and rider sessions.

## 5. Enable Microsoft Edge Bangla voice

Install Python with pip, then run:

```powershell
python -m pip install edge-tts
python -m edge_tts --voice bn-BD-NabanitaNeural --text "স্বাগতম। নতুন অর্ডার এসেছে।" --write-media bangla-test.mp3
```

Play the generated MP3 to check speech. Internet access to Microsoft's speech service is required.

Before starting Maven, in the same PowerShell terminal, select the actual Python executable:

```powershell
$env:PYTHON_TTS_BIN = (python -c "import sys; print(sys.executable)")
mvn spring-boot:run
```

If your Python command is `py`, use `py` instead of `python` in those commands. The local `.tools` runtime from the author's computer is intentionally not included in GitHub. On macOS/Linux, use your Python executable with `export PYTHON_TTS_BIN="$(python3 -c 'import sys; print(sys.executable)')"` before starting Maven.

Log in as seller, select **Bangla** voice and click **Greeting**. Use **Replay Voice** on an order to hear its announcement. A browser may require a click before allowing sound.

## 6. Test checkout and delivery

1. Customer: add a product and place a cash or online order. For online demo payment, enter an 11-digit dummy wallet number such as `00000000000`.
2. Online checkout simulates successful payment and shows **Paid**. This is demo payment: no money is transferred and no merchant gateway is connected.
3. Seller: open the order and choose **Deliver myself** or **Use rider / View requests**.
4. Manual delivery: Accept → Start Packing → Mark Ready → Start manual delivery → Mark delivered.
5. Rider delivery: rider sets Available and sends an offer; seller accepts it. Seller marks the order Ready, then rider verifies the pickup code and marks it delivered.

## 7. Optional mobile app

Node.js/npm are needed only for the mobile/Expo app. From the project root:

```powershell
cd kaser-dokan-mobile
npm ci
Copy-Item .env.example .env
```

Set `EXPO_PUBLIC_API_URL` in that `.env` to your computer's LAN address and backend port, for example `http://192.168.1.10:3000`. A physical phone cannot use your computer's `localhost`. Keep both devices on the same network and allow access to the backend port, then run:

```powershell
npm start
```

Follow Expo's instructions for a compatible client/development build. On a shared deployment, create individual accounts instead of using these public demo passwords.

## Troubleshooting

- Login fails: check that the seed and backend use the same MongoDB server and `kaser_dokan_demo` database.
- Connection refused: start MongoDB and the backend; verify the URL and port.
- No shops nearby: search near the demo coordinates above and check shop availability.
- Voice fails: test the Python command, set `PYTHON_TTS_BIN`, restart the backend and check internet access.
- Do not commit your `.env`, real database exports, uploads or credentials. The repository's `.gitignore` excludes those files.
