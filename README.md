# Devansh Bhosale Portfolio

A cinematic, single-page developer portfolio rebuilt around the observed interaction architecture of the Lando Norris reference site. The content and visual assets are personal placeholders; the animation code is an original clean-room implementation.

## Motion scenes

- Full-screen papaya loading veil with animated canvas lines and ellipse exit.
- Fixed navigation that scales during the opening scroll.
- Interactive particle-and-fluid hero canvas.
- 220vh sticky hero that shrinks into a framed message.
- Scroll-drawn signature flourish.
- Orange line-cover text wipes.
- Desktop pinned horizontal project narrative with internal image parallax.
- Vertical editorial project narrative on mobile.
- Opposing Engineering and Design panels entering from both sides.
- Full-width scroll-zoom image handoff.
- Four-column project archive with staggered column offsets.
- Ellipse image reveals on archive hover.
- Scroll-controlled featured-project visor and floating image collage.
- Technology marquee that reverses with scroll direction.
- Elastic social-card fan with neighbor repulsion on hover.
- Ellipse-opening navigation menu with parallax image columns.
- Masked contact footer opening on scroll.
- Duplicate-text rollovers for navigation and calls to action.
- A Motion On/Off control in the desktop navigation.

The helmet and film sections are excluded as requested.

## Run locally

```bash
npx --yes serve . -l 5173
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

The animation system defaults to **Motion On**, even if Windows system animations are disabled. Use the Motion On button in the desktop navigation to switch the site to its manual low-motion mode.

## Personalize

1. Read `FILL-ME.md`.
2. Edit `js/content.js` only.
3. Add real project screenshots to `assets/`.
4. Replace the placeholder image URLs with paths such as `assets/jobkar.jpg`.
5. Add working project, GitHub, LinkedIn and email links.

## Internet requirements

The current development version loads Google Fonts, GSAP, Lenis and seeded placeholder images from public CDNs. For deployment, the fonts and JavaScript libraries can be self-hosted if a fully offline build is required.

## File structure

```text
portfolio/
  assets/
  css/style.css
  js/content.js
  js/main.js
  index.html
  FILL-ME.md
  README.md
```
