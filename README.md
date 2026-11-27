# Ninja Sabar

A 2D pixel-art endless runner with troll traps. Everything (art, sound, UI) is procedural, with no external assets.

- `src/ninja-sabar.html` — game source (artifact body)
- `index.html` — standalone build (`node tools/build.js`)
- `tools/test.js` — runs the self-tests in headless Chromium (`node tools/test.js <out-dir> tests`)
- `tools/visual.js` — trap screenshots, death flow, FPS, mobile touch

Controls: Space/↑ jump (press again in the air for a double jump), ↓ slide, P pause, R restart, M sound, ` or F2 debug (I = invincible).
