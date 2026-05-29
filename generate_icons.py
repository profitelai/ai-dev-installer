"""Generate PNG icons for the Chrome extension (requires Pillow)."""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [16, 32, 48, 128]
OUT = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(OUT, exist_ok=True)

for size in SIZES:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background circle (blue-purple gradient approximated as solid)
    r = size // 2
    draw.ellipse([0, 0, size - 1, size - 1], fill=(31, 111, 235))

    # Lightning bolt "⚡" text
    font_size = int(size * 0.55)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Apple Color Emoji.ttc', font_size)
    except Exception:
        font = ImageFont.load_default()

    text = '⚡'
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
    except Exception:
        tw = th = font_size

    x = (size - tw) // 2
    y = (size - th) // 2 - 1
    draw.text((x, y), text, font=font, embedded_color=True)

    path = os.path.join(OUT, f'icon{size}.png')
    img.save(path)
    print(f'  {path}')

print('Icons generated.')
