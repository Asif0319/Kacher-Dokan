# v28 – Original Microsoft Edge TTS restoration

The v27 Spring Boot /api/tts always returned HTTP 502, causing browser speech fallback. v28 calls the `edge-tts` Python module directly and streams its MP3 output to the web app.

## Mac setup

Install Python 3 and run `python3 -m pip install edge-tts` in an environment that allows pip. If Python is externally managed, use a virtual environment: `python3 -m venv .venv-tts && .venv-tts/bin/pip install edge-tts`, then `export PYTHON_TTS_BIN="$PWD/.venv-tts/bin/python"` before running the launcher.

Voices: Bangla `bn-BD-NabanitaNeural`, English `en-US-AriaNeural`. Voice language is independent of the UI language. Choose Bangla under seller dashboard Voice Language and press Test Voice / Replay Greeting.

Edge TTS requires an internet connection and may change availability. If unavailable, browser voice is a fallback. No live integration testing against Microsoft or the user's MongoDB was possible here.
