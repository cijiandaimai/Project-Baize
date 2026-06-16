"""Convert a chroma-key video into transparent idle animation frames."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import imageio.v3 as iio
import numpy as np
from PIL import Image


def estimate_key_color(frame: np.ndarray) -> np.ndarray:
    sample = 24
    corners = np.concatenate(
        [
            frame[:sample, :sample].reshape(-1, 3),
            frame[:sample, -sample:].reshape(-1, 3),
            frame[-sample:, :sample].reshape(-1, 3),
            frame[-sample:, -sample:].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(corners, axis=0).astype(np.float32)


def remove_key(frame: np.ndarray, key_color: np.ndarray) -> Image.Image:
    rgb = frame.astype(np.float32)
    distance = np.linalg.norm(rgb - key_color, axis=2)
    alpha = np.clip((distance - 42.0) / 78.0, 0.0, 1.0)

    magenta_like = (
        (rgb[..., 0] > 170)
        & (rgb[..., 1] < 95)
        & (rgb[..., 2] > 140)
        & (np.abs(rgb[..., 0] - rgb[..., 2]) < 95)
    )
    alpha[magenta_like & (distance < 105)] *= np.clip(
        (distance[magenta_like & (distance < 105)] - 42.0) / 63.0,
        0.0,
        1.0,
    )
    alpha[alpha < 0.025] = 0.0

    safe_alpha = np.maximum(alpha[..., None], 0.05)
    foreground = np.clip(
        (rgb - (1.0 - alpha[..., None]) * key_color) / safe_alpha,
        0,
        255,
    )
    foreground[alpha == 0] = 0
    rgba = np.dstack([foreground, alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def trim_and_fit(image: Image.Image, size: int) -> Image.Image:
    alpha = np.asarray(image.getchannel("A"))
    ys, xs = np.where(alpha > 8)
    if len(xs) == 0 or len(ys) == 0:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))

    left, right = xs.min(), xs.max() + 1
    top, bottom = ys.min(), ys.max() + 1
    width, height = right - left, bottom - top
    padding = max(4, math.ceil(max(width, height) * 0.035))
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)

    cropped = image.crop((left, top, right, bottom))
    cropped.thumbnail((size, size), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - cropped.width) // 2
    y = (size - cropped.height) // 2
    canvas.alpha_composite(cropped, (x, y))
    return canvas


def convert_video(source: Path, output_dir: Path, fps: int, size: int) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    for frame_path in output_dir.glob("frame_*.png"):
        frame_path.unlink()

    meta = iio.immeta(source)
    source_fps = float(meta.get("fps", 24))
    step = max(1, round(source_fps / fps))

    written = 0
    key_color: np.ndarray | None = None
    for index, frame in enumerate(iio.imiter(source)):
        if index % step != 0:
            continue
        rgb = np.asarray(frame[..., :3], dtype=np.uint8)
        if key_color is None:
            key_color = estimate_key_color(rgb)
        transparent = remove_key(rgb, key_color)
        fitted = trim_and_fit(transparent, size)
        fitted.save(output_dir / f"frame_{written:03d}.png")
        written += 1

    metadata = {
        "source": str(source),
        "source_fps": source_fps,
        "fps": fps,
        "size": size,
        "frames": written,
        "key_color": key_color.tolist() if key_color is not None else None,
    }
    (output_dir / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return written


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--fps", type=int, default=12)
    parser.add_argument("--size", type=int, default=220)
    args = parser.parse_args()

    frames = convert_video(args.source, args.out, args.fps, args.size)
    print(f"Wrote {frames} animation frames to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
