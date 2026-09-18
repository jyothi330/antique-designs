# -*- coding: utf-8 -*-
"""
compress_images.py
Bulk-compress all JPEGs in the antique_designs_project.
- Max dimension: 1400px (products), 1920px (hero)
- JPEG quality: 72-80
- Overwrites originals in-place (filenames unchanged)
- Skips files already small enough
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import os
from pathlib import Path
from PIL import Image, ExifTags

# Allow very large originals (disable decompression bomb check)
Image.MAX_IMAGE_PIXELS = None

BASE = Path(__file__).parent

RULES = [
    # (glob_pattern, max_px, quality, skip_if_under_kb)
    ("gallery/hero*.jpg",  1920, 80, 150),
    ("gallery/g*.jpg",     1200, 75,  80),
    ("gallery/review*.jpg",1200, 75,  80),
    ("products/**/*.jpg",  1400, 72,  30),
    ("logo.jpeg",           400, 85,  30),
]

def fix_rotation(img):
    try:
        exif = img._getexif()
        if not exif:
            return img
        for k, v in ExifTags.TAGS.items():
            if v == "Orientation":
                ori = exif.get(k)
                if ori == 3:
                    img = img.rotate(180, expand=True)
                elif ori == 6:
                    img = img.rotate(270, expand=True)
                elif ori == 8:
                    img = img.rotate(90,  expand=True)
                break
    except Exception:
        pass
    return img

def compress(path, max_px, quality, min_kb):
    size_before = path.stat().st_size
    if size_before < min_kb * 1024:
        print("  SKIP  %s  (%d KB)" % (path.relative_to(BASE), size_before // 1024), flush=True)
        return 0
    try:
        img = Image.open(path).convert("RGB")
        img = fix_rotation(img)
        w, h = img.size
        if max(w, h) > max_px:
            ratio = max_px / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
        size_after = path.stat().st_size
        pct = int((1 - size_after / size_before) * 100)
        print("  OK    %s  %dKB -> %dKB  (-%d%%)" % (
            path.relative_to(BASE), size_before // 1024, size_after // 1024, pct), flush=True)
        return size_before - size_after
    except Exception as e:
        print("  ERROR %s: %s" % (path.relative_to(BASE), e), flush=True)
        return 0

def main():
    total_saved = 0
    total_files = 0
    for glob_pattern, max_px, quality, min_kb in RULES:
        files = sorted(BASE.glob(glob_pattern))
        if not files:
            print("\n[No files matched: %s]" % glob_pattern)
            continue
        print("\n-- %s (%d files, max %dpx, q%d) --" % (
            glob_pattern, len(files), max_px, quality))
        for f in files:
            total_saved += compress(f, max_px, quality, min_kb)
            total_files += 1
    print("\n" + "=" * 60)
    print("Done. %d files processed." % total_files)
    print("Total saved: %.1f MB" % (total_saved / (1024 * 1024)))

if __name__ == "__main__":
    main()
