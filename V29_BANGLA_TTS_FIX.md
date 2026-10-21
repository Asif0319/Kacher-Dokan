# v29 Bangla voice repair and diagnostics

This build uses Microsoft Edge TTS only for Bangla; it no longer silently replaces Bangla with an English-sounding browser voice. The Mac launcher creates `.venv-tts`, installs `edge-tts` if needed, and passes its Python path to Spring Boot. It requires internet access to install and synthesize audio.

## Run on Mac
`bash RESTART_SPRING_MAC.command`

Select **Bangla** in Seller Dashboard > Voice Language, then press Test Voice. For diagnostics open browser DevTools Console for `[Kacher Dokan TTS]`, and check Spring Boot Terminal. With a logged-in session `/api/tts/status` reports whether the *configured interpreter* has edge-tts installed. A successful status does not prove the Microsoft upstream network is reachable.

## Limitations
External Microsoft TTS service cannot be end-to-end tested in this isolated environment. An authenticated account, database and Mac audio device are needed for full app verification. Existing saved language preferences can still be English: select Bangla once to explicitly save the desired choice.
