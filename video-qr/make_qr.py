#!/usr/bin/env python3
"""根据 people.json 批量生成专属二维码，并输出可打印的 A4 二维码页。

用法：
    python3 make_qr.py --base https://你的域名/
"""

import argparse
import base64
import io
import json
import os
import re

import qrcode
from qrcode.constants import ERROR_CORRECT_M


def safe_filename(text):
    return re.sub(r'[\\/:*?"<>|\s]+', "_", text).strip("_") or "page"


def make_qr_image(url):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_M, box_size=12, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white").convert("RGB")


def build_print_html(event, base, items):
    cells = []
    for uid, person, data_uri in items:
        cells.append(
            '<div class="cell">'
            f'<img src="{data_uri}" alt="{uid}">'
            f'<div class="who">{person.get("name", "")}</div>'
            f'<div class="uid">{uid}</div>'
            "</div>"
        )
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>{event} · 二维码打印页</title>
<style>
  @page {{ size: A4; margin: 10mm; }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; color: #111; }}
  h1 {{ font-size: 14px; font-weight: 600; margin: 0 0 4mm; }}
  .base {{ font-size: 9px; color: #777; margin: 0 0 6mm; word-break: break-all; }}
  .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 6mm 5mm; }}
  .cell {{ text-align: center; break-inside: avoid; }}
  .cell img {{ width: 100%; max-width: 42mm; display: block; margin: 0 auto 1.5mm; }}
  .who {{ font-size: 11px; font-weight: 600; }}
  .uid {{ font-size: 9px; color: #888; }}
  @media print {{ .noprint {{ display: none; }} }}
  @media screen {{
    body {{ max-width: 186mm; margin: 24px auto; padding: 0 10mm; }}
  }}
  .noprint {{ font-size: 10px; color: #999; margin-top: 6mm; }}
</style>
</head>
<body>
  <h1>{event} · 专属二维码</h1>
  <p class="base">扫码地址：{base}</p>
  <div class="grid">
    {''.join(cells)}
  </div>
  <p class="noprint">此页可直接用浏览器打印（A4）。每张二维码对应一个人的专属页面。</p>
</body>
</html>
"""


def main():
    parser = argparse.ArgumentParser(description="批量生成专属二维码")
    parser.add_argument("--base", required=True, help="页面部署后的网址，例如 https://你的域名/ 或 http://192.168.1.5:8000/")
    parser.add_argument("--data", default="people.json", help="人员配置文件，默认 people.json")
    parser.add_argument("--out", default="qrcodes", help="二维码输出目录，默认 qrcodes")
    args = parser.parse_args()

    with open(args.data, "r", encoding="utf-8") as f:
        config = json.load(f)

    event = config.get("event", "专属视频")
    people = config.get("people", {})
    if not people:
        raise SystemExit("people.json 里没有找到 people 数据")

    base = args.base.rstrip("/")
    os.makedirs(args.out, exist_ok=True)

    items = []
    for uid, person in people.items():
        url = f"{base}/?uid={uid}"
        img = make_qr_image(url)

        filename = f"{uid}_{safe_filename(person.get('name', ''))}.png"
        img.save(os.path.join(args.out, filename), "PNG")

        buf = io.BytesIO()
        img.save(buf, "PNG")
        data_uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
        items.append((uid, person, data_uri))
        print(f"{uid:>4}  {person.get('name', ''):<6} {url}")

    print_path = os.path.join(args.out, "print.html")
    with open(print_path, "w", encoding="utf-8") as f:
        f.write(build_print_html(event, base, items))

    print(f"\n共生成 {len(items)} 张二维码 -> {args.out}/")
    print(f"打印页 -> {print_path}")


if __name__ == "__main__":
    main()
