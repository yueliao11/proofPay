"""Build final pitch video from slide images and per-slide audio."""

import os
import subprocess
from pathlib import Path
from typing import List


def _get_duration(path: str) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def _build_slide_clip(image_path: str, audio_path: str, output_path: str) -> None:
    """Create a video clip from a slide image with the exact duration of its audio."""
    duration = _get_duration(audio_path)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loop",
            "1",
            "-i",
            image_path,
            "-i",
            audio_path,
            "-c:v",
            "libx264",
            "-tune",
            "stillimage",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-pix_fmt",
            "yuv420p",
            "-shortest",
            "-t",
            str(duration),
            "-vf",
            "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2",
            output_path,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def build_video(
    image_paths: List[str],
    audio_paths: List[str],
    output_path: str,
    temp_dir: str = "",
) -> str:
    """Build final video from paired slide images and audio files."""
    if len(image_paths) != len(audio_paths):
        raise ValueError("image_paths and audio_paths must have the same length")

    if not temp_dir:
        temp_dir = os.path.join(os.path.dirname(output_path), "clips")
    Path(temp_dir).mkdir(parents=True, exist_ok=True)

    clip_paths = []
    for i, (img, aud) in enumerate(zip(image_paths, audio_paths)):
        clip = os.path.join(temp_dir, f"clip_{i:03d}.mp4")
        _build_slide_clip(img, aud, clip)
        clip_paths.append(clip)

    # Concatenate clips
    concat_file = os.path.join(temp_dir, "concat.txt")
    with open(concat_file, "w") as f:
        for clip in clip_paths:
            f.write(f"file '{clip}'\n")

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            concat_file,
            "-c",
            "copy",
            output_path,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    return output_path


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 4:
        print("Usage: python video_builder.py <images_dir> <audio_dir> <output.mp4>")
        sys.exit(1)

    images_dir = sys.argv[1]
    audio_dir = sys.argv[2]
    output = sys.argv[3]

    images = sorted([os.path.join(images_dir, f) for f in os.listdir(images_dir) if f.endswith((".png", ".jpg"))])
    audios = sorted([os.path.join(audio_dir, f) for f in os.listdir(audio_dir) if f.endswith(".mp3")])
    build_video(images, audios, output)
    print("Built", output)
