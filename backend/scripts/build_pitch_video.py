#!/usr/bin/env python3
"""End-to-end pitch video builder for ProofPay.

1. Capture slide screenshots from pitch-deck.html
2. Extract slide text and generate narration
3. Generate audio with edge-tts
4. Build final video with ffmpeg
"""

import asyncio
import http.server
import os
import socketserver
import sys
import threading
from pathlib import Path

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.core.narration import generate_narration
from app.core.tts import generate_all_speech
from app.core.video_builder import build_video

PITCH_HTML = "/Volumes/extdisk/project/sui/proofPay/pitch/pitch-deck.html"
OUTPUT_DIR = "/Volumes/extdisk/project/sui/proofPay/pitch/backend-output"
VOICE = "en-US-JennyNeural"
STYLE = "crypto_pitch"


def extract_slides(html_path: str):
    """Return list of slide HTML strings from reveal.js deck."""
    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    slides = []
    for section in soup.find_all("section", class_="slides"):
        # reveal.js wraps slides in <section class="slides"><section>...</section></section>
        for child in section.find_all("section", recursive=False):
            slides.append(str(child))
    # If no nested structure, use direct children
    if not slides:
        container = soup.find("div", class_="slides")
        if container:
            slides = [str(child) for child in container.find_all("section", recursive=False)]
    return slides


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def start_server(directory: str, port: int = 8765):
    os.chdir(directory)
    handler = QuietHandler
    httpd = socketserver.TCPServer(("", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


async def capture_slides(html_path: str, output_dir: str, port: int = 8765):
    """Capture a screenshot for each slide using reveal.js navigation."""
    html_dir = os.path.dirname(html_path)
    server = start_server(html_dir, port)
    await asyncio.sleep(0.5)

    image_paths = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        await page.goto(f"http://localhost:{port}/{os.path.basename(html_path)}")
        await asyncio.sleep(2)

        # Get total number of slides
        total = await page.evaluate("() => Reveal.getTotalSlides()")
        print(f"Capturing {total} slides...")

        for i in range(total):
            await page.evaluate(f"() => Reveal.slide({i}, 0, 0)")
            await asyncio.sleep(0.8)
            img_path = os.path.join(output_dir, f"slide_{i:03d}.png")
            await page.screenshot(path=img_path, full_page=False)
            image_paths.append(img_path)

        await browser.close()

    server.shutdown()
    return image_paths


def main():
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    audio_dir = os.path.join(OUTPUT_DIR, "audio")
    clip_dir = os.path.join(OUTPUT_DIR, "clips")
    Path(audio_dir).mkdir(parents=True, exist_ok=True)

    print("Extracting slide text...")
    slides = extract_slides(PITCH_HTML)
    if not slides:
        print("No slides found. Exiting.")
        sys.exit(1)
    print(f"Found {len(slides)} slides.")

    print("Generating narration...")
    narrations = generate_narration(
        [{"html": s} for s in slides],
        mode="auto_from_slide_text",
        style=STYLE,
    )
    # Save narrations for reference
    with open(os.path.join(OUTPUT_DIR, "narration.txt"), "w", encoding="utf-8") as f:
        for i, n in enumerate(narrations):
            f.write(f"Slide {i}: {n}\n\n")

    print("Generating speech with edge-tts...")
    audio_paths = generate_all_speech(narrations, audio_dir, voice=VOICE)

    print("Capturing slide screenshots...")
    image_paths = asyncio.run(capture_slides(PITCH_HTML, OUTPUT_DIR))

    if len(image_paths) != len(audio_paths):
        print(f"Warning: {len(image_paths)} images vs {len(audio_paths)} audio files. Trimming to min.")
        n = min(len(image_paths), len(audio_paths))
        image_paths = image_paths[:n]
        audio_paths = audio_paths[:n]

    output_video = os.path.join(OUTPUT_DIR, "proofpay-pitch-edge-tts.mp4")
    print("Building final video...")
    build_video(image_paths, audio_paths, output_video, temp_dir=clip_dir)

    print(f"Done: {output_video}")


if __name__ == "__main__":
    main()
