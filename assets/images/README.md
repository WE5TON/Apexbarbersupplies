# Product imagery

This folder is where final product photography goes. Until it's added, the
site renders elegant inline SVG line-art placeholders defined directly in
`index.html` (search for `product-glyph`), so there are no broken image
links anywhere on the site.

Add the following files here, using these exact names — `index.html` already
has comments marking exactly where each `<img>` should replace its
placeholder `<svg>` block:

| File                          | Product               | Recommended size      |
| ------------------------------ | ---------------------- | ---------------------- |
| `apex-pro-clipper.webp`        | Apex Pro Clipper       | 1600 × 2000px, portrait |
| `apex-detail-trimmer.webp`     | Apex Detail Trimmer    | 1600 × 2000px, portrait |
| `apex-foil-shaver.webp`        | Apex Foil Shaver       | 1600 × 2000px, portrait |
| `apex-precision-shears.webp`   | Apex Precision Shears  | 1600 × 2000px, portrait |
| `og-image-placeholder.svg`     | Social share preview   | already included — replace with a real 1200 × 630px PNG/JPG when ready |

Guidelines:

- Export as WebP (or AVIF) for the best size/quality balance.
- Keep a consistent dark or transparent background so products sit
  naturally against `--background` (`#050505`).
- Always set explicit `width` and `height` attributes on the `<img>` tag
  once added, to avoid layout shift.
- See the main `README.md` at the project root for the full walkthrough
  of swapping placeholders for real photography.
