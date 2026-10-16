"""Cut the slide regions cited by client/src/sections out of the lecture PDF.

Usage: pdftoppm -r 150 -png Bai02_Quan_ly_tap_tin.pdf <tmp>/s
       python3 scripts/crop_slides.py <tmp> client/public/slides
Boxes are (x0, y0, x1, y1) in 100 dpi pixels; scaled to the 150 dpi render.
"""
import sys
from PIL import Image

CROPS = {
    38: (95, 180, 560, 650), 39: (90, 75, 1300, 690), 45: (95, 115, 1300, 695),
    48: (685, 70, 1320, 680), 49: (95, 115, 1310, 690), 51: (95, 115, 1270, 665),
    52: (345, 265, 985, 510), 53: (95, 115, 1130, 660), 54: (95, 115, 1270, 640),
    55: (95, 115, 1320, 690), 57: (95, 115, 1300, 500), 58: (95, 115, 1334, 400),
    59: (95, 115, 1120, 655), 64: (95, 115, 1334, 585), 66: (95, 115, 1334, 615),
    67: (95, 115, 1334, 420),
}

src, dst = sys.argv[1], sys.argv[2]
for n, box in CROPS.items():
    im = Image.open(f"{src}/s-{n:02d}.png").convert("RGB")
    im.crop(tuple(int(v * 1.5) for v in box)).save(f"{dst}/slide-{n}.jpg", quality=85, optimize=True)
