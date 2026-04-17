"""One-off image prep for pontoon-boats.html refresh.

Converts the HEICs the user supplied to high-quality JPEGs and copies
the JPG/WebP sources into images/ with descriptive filenames.
"""
import shutil
from pathlib import Path

from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

ROOT = Path(r"C:\Users\nickp\OCA Website")
USER = ROOT / "user images"
GBP = USER / "GBP photos"
OUT = ROOT / "images"

# (src_path, dest_filename) — HEICs get converted, others get copied.
ITEMS = [
    # 6 "Six Reasons" cards — image replacements for 3 of them
    (GBP / "2025-08-06 (1).webp", "pontoon-horses-beach.webp"),
    (GBP / "o (5).jpg", "pontoon-beach-assateague-horse.jpg"),
    (GBP / "2021-07-11.webp", "pontoon-fish-crab.webp"),

    # "Perfect For Any Group" occasion cards
    (GBP / "o (6).jpg", "pontoon-family-day.jpg"),
    (USER / "pontoon-boat-rental-oc-md-11-1024x602 (1).jpg", "pontoon-bachelorette.jpg"),
    (GBP / "o (4).jpg", "pontoon-kids-jumping.jpg"),
    (GBP / "2022-09-04.webp", "pontoon-sunset-cruise.webp"),
    (USER / "IMG_0017.HEIC", "pontoon-corporate-group.jpg"),

    # "Pontoon Life" gallery
    (USER / "155154363_227224149118053_6474431153675265732_n-1024x582.jpg", "pontoon-life-01.jpg"),
    (USER / "pontoon-boat-rental-oc-md-2.jpg", "pontoon-life-02.jpg"),
    (USER / "pontoon-boat-rental-oc-md-12.jpg", "pontoon-life-03.jpg"),
    (USER / "under-the-bridge-watersports (1).jpg", "pontoon-life-04.jpg"),
    (USER / "180C2026-9ED2-4E26-AF4C-C46ADC248CB3.jpg", "pontoon-life-05.jpg"),
    (USER / "IMG_1809.HEIC", "pontoon-life-06.jpg"),
    (USER / "IMG_1476.HEIC", "pontoon-life-07.jpg"),
    (USER / "IMG_1748.HEIC", "pontoon-life-08.jpg"),
    (USER / "IMG_1561.HEIC", "pontoon-life-09.jpg"),
    (USER / "IMG_1429.HEIC", "pontoon-life-10.jpg"),
    (USER / "IMG_1425.HEIC", "pontoon-life-11.jpg"),
    (USER / "IMG_1421.HEIC", "pontoon-life-12.jpg"),
    (USER / "IMG_0842.HEIC", "pontoon-life-13.jpg"),
    (USER / "IMG_0059.HEIC", "pontoon-life-14.jpg"),
    (USER / "IMG_9843.HEIC", "pontoon-life-15.jpg"),
    (USER / "IMG_9746.HEIC", "pontoon-life-16.jpg"),
    (USER / "IMG_2149.jpeg", "pontoon-life-17.jpg"),
]


def process(src: Path, dest: str) -> None:
    target = OUT / dest
    if not src.exists():
        print(f"MISSING: {src}")
        return
    if src.suffix.lower() in (".heic", ".heif"):
        img = Image.open(src)
        if img.mode != "RGB":
            img = img.convert("RGB")
        # Auto-orient from EXIF, then cap dimensions to a web-friendly size.
        img.save(target, "JPEG", quality=85, optimize=True)
        print(f"CONVERTED {src.name} -> {target.name}")
    else:
        shutil.copy2(src, target)
        print(f"COPIED    {src.name} -> {target.name}")


for src, dest in ITEMS:
    process(src, dest)

print("Done.")
