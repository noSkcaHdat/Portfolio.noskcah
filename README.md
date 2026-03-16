# HacksonAloysis Portfolio

Static portfolio site ready for GitHub Pages or any static hosting.

## Project Structure

- `index.html`: main website file
- `_astro/`: site CSS, JS, and media assets used by the design
- `images/`: your custom images and media
- `icons/`: favicon and app icons
- `fonts/`: local fonts used by the site
- `content/site-content.template.json`: editable site content
- `tools/site_content.py`: export/apply script for updating content safely

## Edit Content

1. Export the current site content:

```powershell
python tools/site_content.py export
```

2. Edit `content/site-content.template.json`.

3. Apply the changes back to the site:

```powershell
python tools/site_content.py apply
```

## Work Section Images

For work cards that should use still images instead of videos:

- set `"media_type": "image"`
- set `"poster_image": "images/your-file.jpg"`
- leave `"video_src": ""`

## Local Preview

You can preview the site locally with:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

This repo is ready for GitHub Pages as a static site:

1. Push this folder to a GitHub repository.
2. In GitHub, open `Settings > Pages`.
3. Set the source to `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder.
5. Save, then wait for GitHub Pages to publish.

## Notes

- The design files are intentionally preserved.
- The content tool now repairs common encoding glitches during updates.
- Cloudflare email-protection and mirror-only files were removed from the live site workflow.
