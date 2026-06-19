# ProofPay Pitch Video Pipeline

A reusable backend pipeline for turning a reveal.js HTML pitch deck into a narrated MP4 video.

## Architecture

```
backend/
├── app/core/narration.py       # Generate per-slide narration
├── app/core/tts.py             # Text-to-speech (edge-tts / pyttsx3 / silent)
├── app/core/video_builder.py   # ffmpeg image + audio assembly
└── scripts/build_pitch_video.py # End-to-end runner
```

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

```bash
source .venv/bin/activate
python scripts/build_pitch_video.py
```

Output: `../pitch/backend-output/proofpay-pitch-edge-tts.mp4`

## Configuration

Create a `.env` file to enable OpenAI narration generation:

```env
OPENAI_API_KEY=sk-...
```

Without an OpenAI key, the pipeline falls back to template-based narration. Supported styles:
- `crypto_pitch` (default)
- `business`
- `education`
- `product_demo`

## TTS Voices

Configure in `app/core/tts.py` or pass a voice alias:

- `en-US-Female` → `en-US-JennyNeural`
- `en-US-Male` → `en-US-GuyNeural`
- `zh-CN-Female` → `zh-CN-XiaoxiaoNeural`
- `zh-CN-Male` → `zh-CN-YunxiNeural`

## Input

The script reads `../pitch/pitch-deck.html`. It expects a reveal.js deck with each slide in a `<section>` element.
