# DESIGN.md — Ormitus Portfolio

Authoritative token source for `/Users/ormitus/portfolio/index.html`.
All UI work must reference these tokens. No hardcoded values.

---

## Color Tokens

Defined in `:root` as CSS custom properties.

| Token      | Value                    | Role                            |
|------------|--------------------------|----------------------------------|
| `--bg`     | `#f0ede7`                | Page background (warm off-white) |
| `--ink`    | `#0a0907`                | Foreground text and fills        |
| `--mid`    | `rgba(10,9,7,.08)`       | Borders, dividers, subtle fills  |
| `--dim`    | `rgba(10,9,7,.3)`        | Secondary text, muted icons      |
| `--hapoel` | `#C8001A`                | Hapoel Easter egg accent red     |

### Hapoel Mode Overrides (`body.hapoel-mode`)

| Token   | Value                    |
|---------|--------------------------|
| `--bg`  | `#C8001A`                |
| `--ink` | `#ffffff`                |
| `--mid` | `rgba(255,255,255,.18)`  |
| `--dim` | `rgba(255,255,255,.5)`   |

### Named Opacity Levels (reference, not tokens)

These raw values appear throughout the codebase — prefer the token where possible:

| Use                          | Value                     |
|------------------------------|---------------------------|
| Very faint background fill   | `rgba(10,9,7,.1)`         |
| Loader number opacity        | `.07`                     |
| Poster image resting opacity | `.88`                     |
| Project row hover text       | `#fff` (on `--ink` sweep) |
| Hapoel muted text            | `rgba(255,255,255,.35)`   |
| Hapoel secondary text        | `rgba(255,255,255,.5)`    |
| Hapoel very muted            | `rgba(255,255,255,.3)`    |

---

## Typography

### Primary Font Stack

```
font-family: 'Space Grotesk', sans-serif;
```

Used for all body copy, nav, labels, loader, and contact values.

### Custom Display Fonts (Fonts section only)

| Font             | Usage                                      |
|------------------|--------------------------------------------|
| `YiddishAnarchy` | Default font-display, glyph grid, tester   |
| `OpatowskiPahad` | Font item `[data-font="opatowski"]`         |
| `Shlumpy`        | Font item `[data-font="shlumpy"]`           |

### Type Scale

| Role                 | Size                              | Weight | Tracking    | Other                  |
|----------------------|-----------------------------------|--------|-------------|------------------------|
| Project name         | `clamp(28px, 3.2vw, 52px)`        | 700    | `-.04em`    | `line-height: 1`       |
| Section headline     | `clamp(40px, 7vw, 112px)`         | 700    | `-.04em`    | `line-height: .95`     |
| Contact headline     | `clamp(64px, 11vw, 190px)`        | 700    | `-.055em`   | `line-height: .85`     |
| Font display sample  | `clamp(60px, 10vw, 140px)`        | —      | `-.01em`    | `line-height: 1`       |
| Font name            | `clamp(32px, 4vw, 56px)`          | 700    | `-.03em`    | `line-height: 1`       |
| Contact value        | `clamp(18px, 2.4vw, 32px)`        | 500    | —           | —                      |
| Loader number        | `22vw`                            | 700    | `-.05em`    | `line-height: .9`      |
| Nav logo             | `13px`                            | 500    | `.22em`     | uppercase              |
| Nav links            | `11px`                            | —      | `.2em`      | uppercase              |
| Section label (sm)   | `10px`                            | —      | `.3em`      | uppercase              |
| Count / meta         | `10px` / `11px`                   | —      | `.18-.22em` | uppercase              |
| Caption / eyebrow    | `9px`                             | —      | `.22-.28em` | uppercase              |
| Loader label         | `11px`                            | —      | `.28em`     | uppercase              |
| Font desc            | `14px`                            | —      | —           | `line-height: 1.75`    |

### Font Rendering

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
font-feature-settings: 'kern' 1, 'liga' 1;
```

---

## Spacing

### Horizontal Padding (section gutter)

| Breakpoint     | Gutter  |
|----------------|---------|
| Default (≥1025px) | `60px` |
| ≤1024px        | `40px`  |
| ≤768px         | `24px`  |
| ≤480px         | `16px`  |

### Section Padding (top / horizontal / bottom)

| Section              | Desktop               | ≤1024px               | ≤768px               | ≤480px               |
|----------------------|-----------------------|-----------------------|----------------------|----------------------|
| Nav                  | `32px 60px`           | `28px 40px`           | `22px 24px`          | —                    |
| Work                 | `120px 60px 80px`     | `110px 40px 80px`     | `100px 24px 60px`    | `60px 16px 40px`     |
| Posters / Fonts      | `56px 60px 0`         | `48px 40px 0`         | `44px 24px 0`        | `36px 16px 0`        |
| Contact              | `120px 60px 100px`    | `100px 40px 80px`     | `70px 24px 60px`     | `50px 16px 40px`     |
| Footer               | `28px 60px`           | —                     | `22px 24px`          | `18px 16px`          |
| Loader               | `64px`                | `48px`                | `32px`               | —                    |

### Component Spacing

| Element                        | Value                     |
|--------------------------------|---------------------------|
| Nav links gap                  | `40px` (≤768px: `20px`)  |
| Work header margin-bottom      | `16px`, padding-bottom `20px` |
| Project row padding            | `26px 0` (≤768px: `20px 0`, ≤480px: `16px 0`) |
| Project row grid gap           | `0 28px` (≤768px: `0 12px`, ≤480px: `0 8px`) |
| Fonts section header padding   | `52px 0 32px` (≤768px: `36px 0 22px`, ≤480px: `28px 0 16px`) |
| Font item margin-bottom        | `100px` (≤768px: `60px`, ≤480px: `40px`) |
| Font item separator padding-top| `80px` |
| Font meta margin-bottom        | `48px` |
| Font display margin-bottom     | `60px` |
| Glyph grid gap                 | `2px` |
| Font tester wrap padding       | `48px 52px` |
| Marquee padding                | `15px 0` |
| Contact link item padding      | `36px 0` → hover `padding-left: 24px` |
| Contact links border-top       | `1px solid var(--mid)` |
| Hapoel toggle: bottom / right  | `36px / 48px` (≤768px: `24px / 24px`, ≤480px: `20px / auto left 20px`) |
| Float image size               | `380px × 240px` |

---

## Borders

All section dividers use `1px solid var(--mid)`.

```
border: 1px solid var(--mid)
border-top: 1px solid var(--mid)
border-bottom: 1px solid var(--mid)
```

Hapoel overrides for some borders:
- `rgba(255,255,255,.15)` — posters and fonts borders
- `rgba(255,255,255,.12)` — marquee bottom, font tester hint top

---

## Border Radius

| Element              | Value       |
|----------------------|-------------|
| Hapoel pill          | `25px`      |
| Hapoel knob          | `50%`       |
| Float image          | `3px`       |
| Glyph cells          | `4px`       |
| Font tester wrap     | `10px`      |
| Skip link            | `0 0 6px 6px` |
| Focus outline        | `2px`       |

---

## Z-Index Layers

| Layer                 | z-index | Element                        |
|-----------------------|---------|-------------------------------|
| Skip link / cursor    | `9999`  | `#cur`, `.skip-link`          |
| Cursor text           | `9998`  | `#cur-txt`                    |
| Loader                | `9000`  | `#loader`                     |
| Float image           | `800`   | `#float-img`                  |
| Hapoel toggle         | `600`   | `#hapoel-toggle-wrap`         |
| Nav                   | `500`   | `nav`                         |
| Project row overlay   | `0/1`   | `::before` (z:0), children (z:1) |

---

## Animation & Easing

### Named Curves

| Name         | Curve                              | Feel                  |
|--------------|------------------------------------|-----------------------|
| expo-out     | `cubic-bezier(.16,1,.3,1)`         | Snappy deceleration   |
| spring       | `cubic-bezier(.34,1.56,.64,1)`     | Overshoot bounce      |
| spring-light | `cubic-bezier(.34,1.3,.64,1)`      | Gentle overshoot      |
| ease-layout  | `cubic-bezier(.4,0,.2,1)`          | Material-style        |

### Transition Map

| Element                    | Property         | Duration | Curve             |
|----------------------------|------------------|----------|--------------------|
| Project row sweep          | `transform`      | `.5s`    | expo-out           |
| Project row arrow          | `transform`      | `.5s`    | spring             |
| Float image show           | `opacity`        | `.35s`   | —                  |
| Float image transform      | `transform`      | `.45s`   | spring             |
| Nav scroll state           | `background`     | `.5s`    | expo-out           |
| Section collapse           | `grid-template-rows` | `.55s` | expo-out          |
| Hapoel knob slide          | `transform`      | `.5s`    | spring-light       |
| Contact link indent        | `padding-left`   | `.35s`   | expo-out           |
| Glyph cell hover           | `transform`      | `.3s`    | spring             |
| Poster image scale         | `transform`      | `.65s`   | expo-out           |
| Poster overlay opacity     | `opacity`        | `.4s`    | —                  |
| Color / opacity changes    | various          | `.2-.3s` | ease               |
| Cursor expand              | `width`, `height`| `.2s`    | —                  |

### Marquee

```
animation: marq 26s linear infinite;
@keyframes marq { to { transform: translateX(-50%); } }
```

Paused when `prefers-reduced-motion: reduce`.

### Scroll Animation (GSAP ScrollTrigger)

- Project rows: `start: 'top 95%'` (fires on load since work is first section)
- Reveal utility: `opacity: 0; transform: translateY(40px)` initial state

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

---

## Breakpoints

| Name    | Max-width |
|---------|-----------|
| Tablet  | `1024px`  |
| Mobile  | `768px`   |
| XS      | `480px`   |

---

## Cursor System

Custom cursor replaces default on non-touch:

- `#cur`: `8px × 8px` dot, `var(--ink)` fill, `mix-blend-mode: difference`
- `#cur.expanded`: `60px × 60px`
- `#cur-txt`: `9px / .22em / uppercase`, `var(--bg)` color, `z-index: 9998`
- Hidden at `≤768px` (`display: none`), `body { cursor: auto }`

Hapoel mode overrides:
- `#cur`: `background: #fff; mix-blend-mode: normal`
- `#cur-txt`: `color: #C8001A`

---

## Shadow / Depth

| Element          | Value                                                             |
|------------------|--------------------------------------------------------------------|
| Float image      | `0 28px 80px rgba(10,9,7,.18), 0 4px 20px rgba(10,9,7,.1)`       |
| Float image ring | `0 0 0 1px rgba(10,9,7,.06)` (subtle outline)                    |
| Hapoel knob      | `0 2px 12px rgba(0,0,0,.2)`                                       |

---

## Sections (Page Structure)

```
nav (fixed, z:500)
#loader (fixed, z:9000 — animates out on load)
#work
.marquee-wrap
#posters
#fonts
#contact
footer
#hapoel-toggle-wrap (fixed, z:600)
#float-img (fixed, z:800 — follows cursor on project hover)
#cur + #cur-txt (fixed, z:9998–9999)
```

### Work Grid Columns

| Breakpoint | Template                               |
|------------|----------------------------------------|
| Desktop    | `54px 1fr auto 60px 40px` (5-col)     |
| ≤768px     | `38px 1fr auto 36px` (4-col, no year) |
| ≤480px     | `30px 1fr 28px` (3-col, 2-row)        |

### Posters Grid

| Breakpoint | Columns |
|------------|---------|
| Desktop    | `repeat(6, 1fr)` |
| ≤1024px    | `repeat(4, 1fr)` |
| ≤768px     | `repeat(3, 1fr)` |

Gap: `5px` (≤1024px: `4px`)

---

## Selection

```css
::selection { background: var(--ink); color: var(--bg); }
body.hapoel-mode ::selection { background: #fff; color: #C8001A; }
```

---

## Focus States

```css
:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 4px;
  border-radius: 2px;
}
```

Project rows and contact links: `outline-offset: -2px` (inset).
Nav links: `outline-color: #fff` (on difference blend).
Hapoel mode: `outline-color: #fff`.
