"""Convert scraped Squarespace pages to markdown with frontmatter.

Blog posts -> content/blog/<slug>.md
Quotes     -> content/quotes/<slug>.md
Images referenced in content are collected into images.txt for download.
"""
import re, os, json, sys
from pathlib import Path
from bs4 import BeautifulSoup
import html2text

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "scrape" / "raw"
OUT_BLOG = ROOT / "content" / "blog"
OUT_QUOTES = ROOT / "content" / "quotes"
OUT_BLOG.mkdir(parents=True, exist_ok=True)
OUT_QUOTES.mkdir(parents=True, exist_ok=True)

h = html2text.HTML2Text()
h.body_width = 0
h.ignore_emphasis = False
h.ignore_images = False
h.ignore_links = False

images = set()

def clean_img_url(url):
    # strip squarespace format query params
    return url.split("?")[0]

def local_img_path(url):
    base = clean_img_url(url)
    name = base.rstrip("/").split("/")[-1]
    # squarespace CDN paths contain a content hash dir; prefix with it for uniqueness
    parts = base.rstrip("/").split("/")
    uniq = parts[-2][-8:] if len(parts) >= 2 else "x"
    safe = re.sub(r"[^A-Za-z0-9._-]", "-", f"{uniq}-{name}")
    return f"/images/content/{safe}"

def process(f, kind):
    src = f.read_text(encoding="utf-8", errors="replace")
    soup = BeautifulSoup(src, "html.parser")
    art = soup.find("article")
    if art is None:
        return None
    title_el = art.find(class_="entry-title") or soup.find("h1")
    title = title_el.get_text(strip=True) if title_el else ""
    time_el = art.find("time")
    date = time_el.get("datetime") if time_el and time_el.get("datetime") else ""
    og = soup.find("meta", attrs={"property": "og:image"})
    og_image = og["content"] if og and og.get("content") else ""
    ogd = soup.find("meta", attrs={"property": "og:description"})
    desc = (ogd["content"] if ogd and ogd.get("content") else "").strip()
    content = art.find(class_="entry-content") or art
    # canonical URL path for redirects / permalink preservation
    canon = soup.find("link", attrs={"rel": "canonical"})
    url_path = ""
    if canon and canon.get("href"):
        url_path = canon["href"].replace("https://www.adamtank.com", "").replace("http://www.adamtank.com", "")

    # fix images: use data-src (full res) when present, rewrite to local
    for img in content.find_all("img"):
        src_url = img.get("data-src") or img.get("src") or ""
        if not src_url:
            img.decompose(); continue
        if "squarespace" in src_url or src_url.startswith("/"):
            if src_url.startswith("/"):
                src_url = "https://www.adamtank.com" + src_url
            images.add(clean_img_url(src_url))
            img["src"] = local_img_path(src_url)
        for attr in ("data-src", "data-image", "srcset", "data-srcset", "style", "class",
                     "data-load", "data-image-dimensions", "data-image-focal-point",
                     "data-image-id", "data-type", "data-parent-ratio", "loading",
                     "data-image-resolution"):
            if img.has_attr(attr):
                del img[attr]

    # drop script/style/social blocks
    for sel in ["script", "style", ".sqs-block-socialaccountlinks-v2", ".sqs-block-newsletter",
                ".sqs-block-button"]:
        for el in content.select(sel):
            el.decompose()

    md = h.handle(str(content)).strip()
    # collapse >2 blank lines
    md = re.sub(r"\n{3,}", "\n\n", md)

    if og_image and "squarespace" in og_image:
        images.add(clean_img_url(og_image))
        og_local = local_img_path(og_image)
    else:
        og_local = ""

    slug = f.stem.split("_")[-1]
    fm = {
        "title": title,
        "date": date,
        "slug": slug,
        "originalPath": url_path,
        "description": desc,
        "image": og_local,
    }
    lines = ["---"]
    for k, v in fm.items():
        lines.append(f'{k}: {json.dumps(v)}')
    lines.append("---\n")
    out = "\n".join(lines) + md + "\n"
    dest = (OUT_BLOG if kind == "blog" else OUT_QUOTES) / f"{slug}.md"
    dest.write_text(out, encoding="utf-8")
    return slug

nb = nq = 0
for f in sorted(RAW.glob("new-blog_*.html")):
    if process(f, "blog"): nb += 1
for f in sorted(RAW.glob("quotes_*.html")):
    if process(f, "quotes"): nq += 1

(ROOT / "scrape" / "images.txt").write_text("\n".join(sorted(images)), encoding="utf-8")
print(f"blog: {nb}, quotes: {nq}, images: {len(images)}")
