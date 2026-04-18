"""Copy the new Pontoon Life gallery photos into images/ with clean names."""
import shutil
from pathlib import Path

ROOT = Path(r"C:\Users\nickp\OCA Website")
GBP = ROOT / "user images" / "GBP photos"
OUT = ROOT / "images"

SOURCES = [
    "2021-04-18.webp",
    "2021-05-19.webp",
    "2021-06-15 (1).webp",
    "2021-06-15.webp",
    "2021-07-11.webp",
    "2021-07-31.webp",
    "2021-09-05.webp",
    "2021-09-20.webp",
    "2022-04-12.webp",
    "2022-04-21 (1).webp",
    "2022-04-27 (2).webp",
    "2022-04-27.webp",
    "2022-05-01.webp",
    "2022-05-30.webp",
    "2022-06-03.webp",
    "2022-07-21.webp",
    "2022-07-23.webp",
    "2022-07-27.webp",
    "2022-08-26.webp",
    "2022-08-31.webp",
    "2022-09-03 (1).webp",
    "2022-09-03 (2).webp",
    "2022-09-03.webp",
    "2022-09-04.webp",
    "2022-09-10.webp",
    "2023-09-15.webp",
]

for i, name in enumerate(SOURCES, start=1):
    src = GBP / name
    dest = OUT / f"pontoon-life-new-{i:02d}.webp"
    if not src.exists():
        print(f"MISSING {name}")
        continue
    shutil.copy2(src, dest)
    print(f"COPIED {name} -> {dest.name}")

print("Done.")
