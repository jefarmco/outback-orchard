# Tools
- `node tune.js 400` – plays every level (tools/levels_src.js) with the casual bot to pick the move count that hits each level's target win-rate, verifies with fresh seeds (casual + greedy bot), sets ★★/★★★ thresholds, writes `js/levels.js` and `tuned.json`.
- `node fuzz.js` – random-play invariant checks on the engine.
- `art/`: `node gen.js all` renders the painted sprites (prelude.js + lib.js + mm.js) in headless Chrome (needs puppeteer-core and Chrome; edit the require path in gen.js), then `python3 pack.py` packs `assets/atlas.webp`, `js/frames.js`, farm/logo/textures and icons.
