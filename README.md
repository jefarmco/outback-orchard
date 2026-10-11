# Outback Orchard 🥭

A mobile-first match-3 with a farm-rebuild meta layer, set on a North Queensland farm.
Match mangoes, lychees, gum leaves, wattle, eggs and passionfruit, earn ★ stars and spend them fixing up Jesse's farm.

**Play:** https://jefarmco.github.io/outback-orchard/ (installable as an app: browser menu → *Add to Home screen*)

- 30 levels with collect, mud, crates, barbed-wire and calf-muster goals
- Specials: Ute (match 4, clears a line), Bore Blast (L/T shape), Cyclone (match 5, clears a colour) and special+special combos
- Boosters earned from play (shovel, tractor, willy-willy, esky, pre-level Bore Blast / Ute). No ads, no purchases.
- 13 farm jobs with before/after art and dialogue from Jesse and Blue the cattle dog
- Works offline (service worker). Progress is saved on the device.

Pure HTML5 canvas + JS, no external libraries or CDNs. Art is procedurally painted and baked to WebP by `tools/art/` (headless Chrome + PIL).
Levels are tuned and verified by a bot (`tools/tune.js`, `tools/bot.js`): a greedy bot and a weaker "casual" bot play every level hundreds of times.
