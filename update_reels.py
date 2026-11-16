"""Refresh the Instagram reels carousel on index.html.

Run:  python update_reels.py

What it does
  1. Reads the latest reel links from the public Instagram profile.
  2. Downloads any new reel (yt-dlp), compresses it (<=30s, 720p, muted) and
     saves a poster image in reels/.
  3. Deletes reels that are no longer in the latest list.
  4. Rewrites the cards between <!-- REELS:START --> and <!-- REELS:END -->
     in index.html.

Needs:  pip install yt-dlp imageio-ffmpeg
"""
import pathlib
import re
import shutil
import subprocess
import sys
import urllib.request

ROOT = pathlib.Path(__file__).parent
REELS = ROOT / "reels"
SRC = REELS / "src"
INDEX = ROOT / "index.html"
PROFILE = "https://www.instagram.com/antique_designs_india/"
MAX_REELS = 9


def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def latest_reel_ids():
    req = urllib.request.Request(PROFILE, headers={"User-Agent": "Googlebot/2.1"})
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    ids = []
    for rid in re.findall(r"/reel/([A-Za-z0-9_-]{8,14})", html):
        if rid not in ids:
            ids.append(rid)
    return ids[:MAX_REELS]


def fetch(rid, ff):
    if (REELS / f"{rid}.mp4").exists() and (REELS / f"{rid}.jpg").exists():
        return True
    SRC.mkdir(parents=True, exist_ok=True)
    src = SRC / f"{rid}.mp4"
    r = subprocess.run(
        [sys.executable, "-m", "yt_dlp", "-q", "--no-warnings", "-o",
         str(SRC / f"{rid}.%(ext)s"), f"https://www.instagram.com/reel/{rid}/"],
        capture_output=True, text=True)
    if r.returncode != 0 or not src.exists():
        print(f"  skip {rid}: download failed")
        return False
    subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(src), "-t", "30",
                    "-vf", "scale=-2:720", "-c:v", "libx264", "-crf", "28",
                    "-preset", "veryfast", "-an", "-movflags", "+faststart",
                    str(REELS / f"{rid}.mp4")], check=True)
    subprocess.run([ff, "-y", "-loglevel", "error", "-ss", "1", "-i", str(src),
                    "-frames:v", "1", "-vf", "scale=-2:720", "-q:v", "4",
                    str(REELS / f"{rid}.jpg")], check=True)
    src.unlink()
    print(f"  added {rid}")
    return True


def card(rid):
    return (
        '      <div class="reel-card">'
        f'<video src="reels/{rid}.mp4" poster="reels/{rid}.jpg" muted loop playsinline preload="none"></video>'
        '<button type="button" class="reel-sound" aria-label="Turn sound on or off">&#128263;</button>'
        f'<a class="reel-link" href="https://www.instagram.com/reel/{rid}/" target="_blank" rel="noopener">View on Instagram</a>'
        '</div>'
    )


def main():
    REELS.mkdir(exist_ok=True)
    ff = ffmpeg_exe()
    ids = latest_reel_ids()
    if not ids:
        sys.exit("No reels found on the profile page - nothing changed.")
    print(f"Found {len(ids)} reels")
    ok = [rid for rid in ids if fetch(rid, ff)]
    if not ok:
        sys.exit("No reels could be downloaded - nothing changed.")
    for f in REELS.glob("*.*"):
        if f.is_file() and f.stem not in ok and f.suffix in (".mp4", ".jpg"):
            f.unlink()
            print(f"  removed {f.name}")
    shutil.rmtree(SRC, ignore_errors=True)

    text = INDEX.read_text(encoding="utf-8")
    nl = "\r\n" if "\r\n" in text else "\n"
    start, end = "<!-- REELS:START -->", "<!-- REELS:END -->"
    a, b = text.index(start) + len(start), text.index(end)
    body = nl + nl.join(card(r) for r in ok) + nl + "      "
    INDEX.write_text(text[:a] + body + text[b:], encoding="utf-8", newline="")
    print(f"index.html updated with {len(ok)} reels")


if __name__ == "__main__":
    main()
