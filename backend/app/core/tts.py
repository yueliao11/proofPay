"""Text-to-speech generation with edge-tts primary, pyttsx3 fallback, silent fallback."""

import asyncio
import os
import subprocess
import tempfile
from pathlib import Path
from typing import List

VOICE_MAP = {
    "en-US-Male": "en-US-GuyNeural",
    "en-US-Female": "en-US-JennyNeural",
    "zh-CN-Male": "zh-CN-YunxiNeural",
    "zh-CN-Female": "zh-CN-XiaoxiaoNeural",
    "ja-JP-Female": "ja-JP-NanamiNeural",
    "ko-KR-Female": "ko-KR-SunHiNeural",
}

DEFAULT_VOICE = "en-US-JennyNeural"


def _pyttsx3_tts(text: str, output_path: str, voice_gender: str = "female") -> bool:
    """Fallback TTS using pyttsx3. On macOS this uses built-in voices."""
    try:
        import pyttsx3

        engine = pyttsx3.init()
        voices = engine.getProperty("voices")
        # Try to pick a reasonable English voice
        target = "Samantha" if voice_gender.lower() in ("female", "f") else "Daniel"
        for v in voices:
            if target.lower() in v.name.lower():
                engine.setProperty("voice", v.id)
                break
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        return os.path.exists(output_path) and os.path.getsize(output_path) > 1024
    except Exception as e:
        print(f"pyttsx3 fallback failed: {e}")
        return False


def _silent_placeholder(output_path: str, duration_sec: int = 3) -> None:
    """Generate a silent MP3 as final fallback."""
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"anullsrc=r=44100:cl=stereo",
            "-t",
            str(duration_sec),
            "-acodec",
            "libmp3lame",
            "-q:a",
            "4",
            output_path,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


async def _edge_tts_async(text: str, output_path: str, voice: str) -> bool:
    try:
        import edge_tts

        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
        return os.path.exists(output_path) and os.path.getsize(output_path) > 1024
    except Exception as e:
        print(f"edge-tts failed: {e}")
        return False


def generate_speech(
    text: str,
    output_path: str,
    voice: str = DEFAULT_VOICE,
    use_async: bool = True,
) -> bool:
    """Generate a single MP3 from text. Returns True on success."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    # Resolve alias
    voice = VOICE_MAP.get(voice, voice)

    # Primary: edge-tts
    try:
        if use_async:
            success = asyncio.run(_edge_tts_async(text, output_path, voice))
        else:
            # Synchronous wrapper for edge-tts
            loop = asyncio.new_event_loop()
            success = loop.run_until_complete(_edge_tts_async(text, output_path, voice))
            loop.close()
        if success:
            return True
    except Exception as e:
        print(f"edge-tts error: {e}")

    # Fallback 1: pyttsx3
    gender = "female" if "Jenny" in voice or "Xiaoxiao" in voice or "Nanami" in voice or "SunHi" in voice else "male"
    if _pyttsx3_tts(text, output_path, gender):
        return True

    # Fallback 2: silent placeholder
    print(f"TTS failed for '{text[:40]}...' generating silent placeholder.")
    _silent_placeholder(output_path, duration_sec=3)
    return False


def generate_all_speech(
    narrations: List[str],
    output_dir: str,
    voice: str = DEFAULT_VOICE,
) -> List[str]:
    """Generate one MP3 per narration. Returns list of file paths."""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    files = []
    for i, text in enumerate(narrations):
        out = os.path.join(output_dir, f"slide_{i:03d}.mp3")
        generate_speech(text, out, voice=voice)
        files.append(out)
    return files


if __name__ == "__main__":
    tmp = tempfile.mkdtemp()
    out = os.path.join(tmp, "test.mp3")
    generate_speech("ProofPay is the settlement layer for AI agent work.", out)
    print("Generated", out, os.path.getsize(out))
