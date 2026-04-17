"""Copy 6-mile-ride carousel images + the new Sandbars photo."""
import shutil
from pathlib import Path

ROOT = Path(r"C:\Users\nickp\OCA Website")
USER = ROOT / "user images"
GBP = USER / "GBP photos"
OUT = ROOT / "images"

ITEMS = [
    # Sandbars image for the Route Timeline Stop 03
    (USER / "images.jpg", "6mile-sandbars-view.jpg"),

    # 21 carousel images — two-line opposite-direction strip
    (GBP / "2021-05-10.webp", "6mile-strip-01.webp"),
    (GBP / "2021-06-11.webp", "6mile-strip-02.webp"),
    (GBP / "2021-06-15 (1).webp", "6mile-strip-03.webp"),
    (GBP / "2021-08-02 (1).webp", "6mile-strip-04.webp"),
    (GBP / "2021-08-02.webp", "6mile-strip-05.webp"),
    (GBP / "2021-09-20 (1).webp", "6mile-strip-06.webp"),
    (GBP / "2021-09-20.webp", "6mile-strip-07.webp"),
    (GBP / "2022-04-21 (1).webp", "6mile-strip-08.webp"),
    (GBP / "2022-04-21.webp", "6mile-strip-09.webp"),
    (GBP / "2022-05-31.webp", "6mile-strip-10.webp"),
    (GBP / "2022-07-02.webp", "6mile-strip-11.webp"),
    (GBP / "2023-08-27.webp", "6mile-strip-12.webp"),
    (GBP / "2024-06-06.webp", "6mile-strip-13.webp"),
    (GBP / "2024-08-27.webp", "6mile-strip-14.webp"),
    (GBP / "2025-04-18.webp", "6mile-strip-15.webp"),
    (GBP / "2025-07-25.webp", "6mile-strip-16.webp"),
    (GBP / "under-the-bridge-watersports (7).jpg", "6mile-strip-17.jpg"),
    (GBP / "unnamed (2).webp", "6mile-strip-18.webp"),
    (GBP / "unnamed (3).webp", "6mile-strip-19.webp"),
    (GBP / "we-need-more-love-in.jpg", "6mile-strip-20.jpg"),
    (USER / "Delmarva Aerial 360-428.jpg", "6mile-strip-21.jpg"),
]

for src, dest in ITEMS:
    target = OUT / dest
    if not src.exists():
        print(f"MISSING: {src}")
        continue
    shutil.copy2(src, target)
    print(f"COPIED {src.name} -> {target.name}")

print("Done.")
