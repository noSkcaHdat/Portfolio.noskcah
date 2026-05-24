#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString

try:
    from ftfy import fix_text as ftfy_fix_text
except ImportError:
    ftfy_fix_text = None


MOJIBAKE_MARKERS = ("Ã", "Â", "â€", "â€™", "â€œ", "â€", "â€“", "â€”", "Æ’", "�")


def looks_mojibake(value: str) -> bool:
    return any(marker in value for marker in MOJIBAKE_MARKERS)


def repair_text(value: str) -> str:
    if not isinstance(value, str) or not value or not looks_mojibake(value):
        return value
    if ftfy_fix_text is None:
        return value
    return ftfy_fix_text(value)


def repair_html_fragment(html_fragment: str) -> str:
    if not isinstance(html_fragment, str) or not html_fragment or not looks_mojibake(html_fragment):
        return html_fragment

    fragment = BeautifulSoup(html_fragment, "html.parser")
    repair_tree(fragment)
    rendered = "".join(str(child) for child in fragment.contents)
    return rendered or repair_text(html_fragment)


def repair_tree(node) -> None:
    attrs = getattr(node, "attrs", None)
    if isinstance(attrs, dict):
        for key, value in list(attrs.items()):
            if isinstance(value, str):
                node[key] = repair_text(value)
            elif isinstance(value, list):
                node[key] = [repair_text(item) if isinstance(item, str) else item for item in value]

    for child in list(getattr(node, "contents", [])):
        if isinstance(child, NavigableString):
            fixed = repair_text(str(child))
            if fixed != str(child):
                child.replace_with(fixed)
            continue
        repair_tree(child)


def repair_value(value, key_hint: str | None = None):
    if isinstance(value, dict):
        return {key: repair_value(item, key) for key, item in value.items()}
    if isinstance(value, list):
        return [repair_value(item, key_hint) for item in value]
    if isinstance(value, str):
        if key_hint and key_hint.endswith("_html"):
            return repair_html_fragment(value)
        return repair_text(value)
    return value


def read_html(path: Path) -> tuple[str, BeautifulSoup]:
    html = path.read_text(encoding="utf-8", errors="replace")
    return html, BeautifulSoup(html, "html.parser")


def write_html(path: Path, original_html: str, soup: BeautifulSoup) -> None:
    rendered = soup.decode(formatter="minimal")
    if original_html.lstrip().lower().startswith("<!doctype html>") and not rendered.lstrip().lower().startswith("<!doctype html>"):
        rendered = "<!DOCTYPE html>\n" + rendered
    path.write_text(rendered, encoding="utf-8")


def inner_html(node) -> str:
    return repair_html_fragment("".join(str(child) for child in node.contents).strip())


def set_inner_html(node, html_fragment: str) -> None:
    node.clear()
    fragment = BeautifulSoup(repair_html_fragment(html_fragment), "html.parser")
    for child in list(fragment.contents):
        node.append(child)


def clone_node(node):
    fragment = BeautifulSoup(str(node), "html.parser")
    for child in fragment.contents:
        if getattr(child, "name", None):
            return child
    raise ValueError("Could not clone node.")


def clone_html(html_fragment: str):
    fragment = BeautifulSoup(html_fragment, "html.parser")
    for child in fragment.contents:
        if getattr(child, "name", None):
            return child
    raise ValueError("Could not clone HTML fragment.")


def ensure_count(nodes: list, target_count: int, template_node) -> list:
    current = list(nodes)
    if target_count < len(current):
        for extra in current[target_count:]:
            extra.decompose()
        current = current[:target_count]
    while len(current) < target_count:
        clone = clone_node(template_node)
        current[-1].insert_after(clone) if current else template_node.parent.append(clone)
        current = list(current) + [clone]
    return current


def set_text(node, value: str) -> None:
    node.clear()
    node.append(repair_text(value))


def get_meta_tag(soup: BeautifulSoup, **attrs):
    return soup.find("meta", attrs=attrs)


def extract_award(li) -> dict:
    if li.select_one(".s__award__name"):
        return {
            "type": "counter",
            "name": li.select_one(".s__award__name").get_text(strip=True),
            "counters": [counter.get_text(strip=True) for counter in li.select(".s__award__counter")],
        }
    return {
        "type": "text",
        "text_html": inner_html(li.select_one(".s__award__text")),
    }


def extract_work_item(item) -> dict:
    link = item.select_one("a[href]")
    video = item.select_one("video")
    video_src = video.get("data-src", "").strip()
    poster_image = video.get("poster", "").strip()
    return {
        "title": item.select_one(".a__caption__text").get_text(strip=True),
        "key": item.select_one(".a__caption__key").get_text(strip=True),
        "href": link.get("href", ""),
        "media_type": "image" if poster_image and not video_src else "video",
        "video_src": video_src,
        "poster_image": poster_image,
    }


def extract_frame(frame) -> dict:
    image = frame.select_one("img")
    caption = frame.select_one("figcaption")
    return {
        "src": image.get("src", ""),
        "alt": image.get("alt", ""),
        "width": image.get("width", ""),
        "height": image.get("height", ""),
        "caption_html": inner_html(caption),
    }


def extract_cta_text(line_node) -> str:
    chunks = []
    for char in line_node.select(".s__cta__char"):
        slice_node = char.select_one(".s__cta__char__slice")
        if not slice_node:
            continue
        chunks.append("".join(slice_node.stripped_strings))
    return "".join(chunks)


def split_cta_groups(text: str) -> list[str]:
    groups: list[str] = []
    for char in text:
        if char == "'" and groups:
            groups[-1] += char
        else:
            groups.append(char)
    return groups


def build_cta_text(cta_text_node, value: str) -> None:
    char_template = cta_text_node.select_one(".s__cta__char")
    slice_template = cta_text_node.select_one(".s__cta__char__slice")
    if not char_template or not slice_template:
        return

    cta_text_node.clear()
    for group in split_cta_groups(value):
        char_node = clone_node(char_template)
        char_node.clear()
        for _ in range(4):
            slice_node = clone_node(slice_template)
            slice_node.clear()
            if group.endswith("'") and len(group) > 1:
                slice_node.append(group[:-1])
                sup = BeautifulSoup("", "html.parser").new_tag("span")
                sup["class"] = "sup"
                sup.append("'")
                slice_node.append(sup)
            elif group == " ":
                slice_node.append(NavigableString("\xa0"))
            else:
                slice_node.append(group)
            char_node.append(slice_node)
        cta_text_node.append(char_node)


def set_multiline_text(node, lines: list[str]) -> None:
    br_template = node.find("br")
    node.clear()
    for index, line in enumerate(lines):
        if index:
            br = clone_node(br_template) if br_template else BeautifulSoup("<br/>", "html.parser").br
            node.append(br)
        node.append(line)


def extract_content(soup: BeautifulSoup) -> dict:
    header = soup.select_one("header.site-head")
    footer = soup.select_one("footer.site-foot")
    about = soup.select_one("#about")
    work = soup.select_one("#work")
    gallery = soup.select_one(".s-my-way")
    cta = soup.select_one(".s-cta")

    awards = [li for li in about.select(".s__awards > li") if "s__award--blank" not in li.get("class", [])]
    work_items = work.select("a-work")
    frames = gallery.select(".a-object--frame")

    menu_items = [span.get_text(strip=True) for span in header.select("nav .sb__text")]
    social_links = []
    for link in header.select(".sb-socials a[href]"):
        label = link.select_one(".u-sr-only").get_text(strip=True).replace("Follow me on ", "")
        social_links.append({"label": label, "href": link.get("href", "")})

    availability_lines = header.select(".sb-availability .sb__line")

    data = {
        "meta": {
            "title": soup.title.get_text(strip=True),
            "description": get_meta_tag(soup, name="description").get("content", ""),
            "site_name": get_meta_tag(soup, property="og:site_name").get("content", ""),
            "og_title": get_meta_tag(soup, property="og:title").get("content", ""),
            "og_description": get_meta_tag(soup, property="og:description").get("content", ""),
            "og_url": get_meta_tag(soup, property="og:url").get("content", ""),
            "og_image": get_meta_tag(soup, property="og:image").get("content", ""),
            "twitter_image": get_meta_tag(soup, name="twitter:image").get("content", ""),
            "apple_mobile_web_app_title": get_meta_tag(soup, name="apple-mobile-web-app-title").get("content", ""),
            "theme_color": get_meta_tag(soup, name="theme-color").get("content", ""),
        },
        "branding": {
            "name": header.select_one(".sb-logo .u-sr-only").get_text(strip=True),
            "menu": menu_items,
            "social_links": social_links,
            "availability": {
                "line_1": availability_lines[0].select_one(".sb__text").get_text(strip=True),
                "line_2": availability_lines[1].select_one(".sb__text").get_text(strip=True),
                "cta_label": availability_lines[1].select_one(".sb__link").get_text(strip=True),
                "cta_href": availability_lines[1].select_one(".sb__link").get("href", ""),
            },
            "qr_code": {
                "href": header.select_one(".sb-qr-code").get("href", ""),
                "title": header.select_one(".sb-qr-code").get("title", ""),
                "src": header.select_one(".sb-qr-code img").get("src", ""),
                "alt": header.select_one(".sb-qr-code img").get("alt", ""),
            },
            "footer_name": footer.select_one(".u-sr-only").get_text(strip=True),
        },
        "hero": {
            "words": [word.get_text(strip=True) for word in soup.select(".s-hero .s__title__word")],
            "star_image": soup.select_one(".s-hero .s__title__asset").get("src", ""),
        },
        "about": {
            "title": about.select_one(".s__block--about .s__title").get_text(strip=True),
            "paragraphs_html": [inner_html(paragraph) for paragraph in about.select(".s__block--about .s__content p")],
            "awards_title": about.select_one(".s__block--awards .s__title").get_text(strip=True),
            "awards": [extract_award(li) for li in awards],
        },
        "work": {
            "title": "".join(letter.get_text(strip=True) for letter in work.select(".s__title__letter")),
            "items": [extract_work_item(item) for item in work_items],
        },
        "gallery": {
            "frames": [extract_frame(frame) for frame in frames],
            "catcher_lines": list(gallery.select_one(".s__catcher__text--normal").stripped_strings),
        },
        "contact": {
            "button_text": cta.select_one(".s__button__text").get_text(strip=True),
            "headline_top": extract_cta_text(cta.select_one(".s__cta__line--top .s__cta__text")),
            "headline_bottom": extract_cta_text(cta.select_one(".s__cta__line--bottom .s__cta__text")),
            "email_label": cta.select_one(".s__cta__link").get_text(strip=True),
            "email_href": cta.select_one(".s__cta__link").get("href", ""),
        },
    }
    return data


def apply_meta(soup: BeautifulSoup, meta_data: dict) -> None:
    soup.title.string = meta_data["title"]
    get_meta_tag(soup, name="description")["content"] = meta_data["description"]
    get_meta_tag(soup, property="og:site_name")["content"] = meta_data["site_name"]
    get_meta_tag(soup, property="og:title")["content"] = meta_data["og_title"]
    get_meta_tag(soup, property="og:description")["content"] = meta_data["og_description"]
    get_meta_tag(soup, property="og:url")["content"] = meta_data["og_url"]
    get_meta_tag(soup, property="og:image")["content"] = meta_data["og_image"]
    get_meta_tag(soup, name="twitter:image")["content"] = meta_data["twitter_image"]
    get_meta_tag(soup, name="apple-mobile-web-app-title")["content"] = meta_data["apple_mobile_web_app_title"]
    get_meta_tag(soup, name="theme-color")["content"] = meta_data["theme_color"]


def apply_branding(soup: BeautifulSoup, branding: dict) -> None:
    set_text(soup.select_one("header.site-head .sb-logo .u-sr-only"), branding["name"])
    set_text(soup.select_one("footer.site-foot .site-foot__logo .u-sr-only"), branding.get("footer_name", branding["name"]))

    menu_spans = soup.select("header.site-head nav .sb__text")
    for span, label in zip(menu_spans, branding["menu"]):
        set_text(span, label)

    social_links = soup.select("header.site-head .sb-socials a[href]")
    for link, social in zip(social_links, branding["social_links"]):
        link["href"] = social["href"]
        sr = link.select_one(".u-sr-only")
        if sr:
            set_text(sr, f"Follow me on {social['label']}")

    availability_lines = soup.select("header.site-head .sb-availability .sb__line")
    set_text(availability_lines[0].select_one(".sb__text"), branding["availability"]["line_1"])
    set_text(availability_lines[1].select_one(".sb__text"), branding["availability"]["line_2"])
    availability_lines[1].select_one(".sb__link")["href"] = branding["availability"]["cta_href"]
    set_text(availability_lines[1].select_one(".sb__link"), branding["availability"]["cta_label"])

    qr_link = soup.select_one("header.site-head .sb-qr-code")
    qr_link["href"] = branding["qr_code"]["href"]
    qr_link["title"] = branding["qr_code"]["title"]
    qr_img = qr_link.select_one("img")
    qr_img["src"] = branding["qr_code"]["src"]
    qr_img["alt"] = branding["qr_code"]["alt"]


def apply_hero(soup: BeautifulSoup, hero: dict) -> None:
    word_nodes = soup.select(".s-hero .s__title__word")
    for node, value in zip(word_nodes, hero["words"]):
        set_text(node, value)
    soup.select_one(".s-hero .s__title__asset")["src"] = hero["star_image"]


def apply_about(soup: BeautifulSoup, about: dict) -> None:
    about_section = soup.select_one("#about")
    set_text(about_section.select_one(".s__block--about .s__title"), about["title"])
    paragraph_parent = about_section.select_one(".s__block--about .s__content")
    paragraphs = paragraph_parent.select("p")
    template_paragraph = paragraphs[0]
    paragraphs = ensure_count(paragraphs, len(about["paragraphs_html"]), template_paragraph)
    for paragraph, html_value in zip(paragraphs, about["paragraphs_html"]):
        set_inner_html(paragraph, html_value)

    set_text(about_section.select_one(".s__block--awards .s__title"), about["awards_title"])
    awards_list = about_section.select_one(".s__awards")
    existing_awards = [li for li in awards_list.find_all("li", recursive=False) if "s__award--blank" not in li.get("class", [])]
    blank_award = awards_list.select_one(".s__award--blank")
    counter_template_html = str(next(li for li in existing_awards if li.select_one(".s__award__name")))
    text_template_html = str(next(li for li in existing_awards if li.select_one(".s__award__text")))

    for li in existing_awards:
        li.decompose()

    insert_before = blank_award
    for award in about["awards"]:
        template_html = counter_template_html if award["type"] == "counter" else text_template_html
        node = clone_html(template_html)
        if award["type"] == "counter":
            set_text(node.select_one(".s__award__name"), award["name"])
            counters = node.select(".s__award__counter")
            template_counter = counters[0]
            counters = ensure_count(counters, len(award["counters"]), template_counter)
            for counter_node, counter_text in zip(counters, award["counters"]):
                set_text(counter_node, counter_text)
        else:
            set_inner_html(node.select_one(".s__award__text"), award["text_html"])
        insert_before.insert_before(node)


def apply_work(soup: BeautifulSoup, work: dict) -> None:
    work_section = soup.select_one("#work")
    title_inner = work_section.select_one(".s__title__inner")
    letter_template = title_inner.select_one(".s__title__letter")
    title_inner.clear()
    for char in work["title"]:
        letter = clone_node(letter_template)
        set_text(letter, char)
        title_inner.append(letter)

    items = work_section.select("a-work")
    template_item = items[0]
    items = ensure_count(items, len(work["items"]), template_item)
    for item, payload in zip(items, work["items"]):
        link = item.select_one("a[href]")
        video = item.select_one("video")
        caption = item.select_one(".a__caption__text")
        key = item.select_one(".a__caption__key")
        media_type = payload.get("media_type", "video")
        video_src = payload.get("video_src", "")
        poster_image = payload.get("poster_image", "")
        link["href"] = payload["href"]
        item["data-media-type"] = media_type
        video["data-media-type"] = media_type
        if media_type == "image":
            video["data-src"] = ""
            video.attrs.pop("src", None)
            if poster_image:
                video["poster"] = poster_image
            else:
                video.attrs.pop("poster", None)
            video["preload"] = "none"
        else:
            video["data-src"] = video_src
            video.attrs.pop("src", None)
            if poster_image:
                video["poster"] = poster_image
            else:
                video.attrs.pop("poster", None)
            video.attrs.pop("preload", None)
        set_text(caption, payload["title"])
        set_text(key, payload["key"])


def apply_gallery(soup: BeautifulSoup, gallery: dict) -> None:
    gallery_section = soup.select_one(".s-my-way")
    frames = gallery_section.select(".a-object--frame")
    template_frame = frames[0]
    frames = ensure_count(frames, len(gallery["frames"]), template_frame)
    for frame, payload in zip(frames, gallery["frames"]):
        image = frame.select_one("img")
        caption = frame.select_one("figcaption")
        image["src"] = payload["src"]
        image["alt"] = payload["alt"]
        if payload.get("width"):
            image["width"] = str(payload["width"])
        if payload.get("height"):
            image["height"] = str(payload["height"])
        set_inner_html(caption, payload["caption_html"])

    distorted = gallery_section.select_one(".s__catcher__text--distorted")
    normal = gallery_section.select_one(".s__catcher__text--normal")
    set_multiline_text(distorted, gallery["catcher_lines"])
    set_multiline_text(normal, gallery["catcher_lines"])


def apply_contact(soup: BeautifulSoup, contact: dict) -> None:
    cta = soup.select_one(".s-cta")
    set_text(cta.select_one(".s__button__text"), contact["button_text"])
    build_cta_text(cta.select_one(".s__cta__line--top .s__cta__text"), contact["headline_top"])
    build_cta_text(cta.select_one(".s__cta__line--bottom .s__cta__text"), contact["headline_bottom"])
    email_link = cta.select_one(".s__cta__link")
    email_link["href"] = contact["email_href"]
    set_text(email_link, contact["email_label"])


def export_command(args) -> None:
    _, soup = read_html(Path(args.html))
    data = repair_value(extract_content(soup))
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def apply_command(args) -> None:
    html_path = Path(args.html)
    original_html, soup = read_html(html_path)
    content = repair_value(json.loads(Path(args.content).read_text(encoding="utf-8")))
    apply_meta(soup, content["meta"])
    apply_branding(soup, content["branding"])
    apply_hero(soup, content["hero"])
    apply_about(soup, content["about"])
    apply_work(soup, content["work"])
    apply_gallery(soup, content["gallery"])
    apply_contact(soup, content["contact"])
    write_html(html_path, original_html, soup)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export and apply editable content for the cloned portfolio site.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    export_parser = subparsers.add_parser("export", help="Extract editable site content into a JSON file.")
    export_parser.add_argument("--html", default="index.html", help="Path to the site HTML file.")
    export_parser.add_argument("--output", default="content/site-content.template.json", help="Where to write the extracted JSON.")
    export_parser.set_defaults(func=export_command)

    apply_parser = subparsers.add_parser("apply", help="Apply a JSON content file back into the cloned HTML.")
    apply_parser.add_argument("--html", default="index.html", help="Path to the site HTML file.")
    apply_parser.add_argument("--content", default="content/site-content.template.json", help="Path to the JSON content file.")
    apply_parser.set_defaults(func=apply_command)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
