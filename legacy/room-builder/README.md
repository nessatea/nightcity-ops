# Room Builder (legacy / experimental)

This is the earlier isometric drag/place apartment editor: grid placement,
collision, wall snapping, rotation, sprite positioning. It became too complex
to keep building and was replaced by a simpler market + vibe-stat + visitor
system (see `src/apartment/`).

These files are not imported anywhere in the active app. They're kept here
in case pieces of the isometric approach (sprite manifest, grid math) are
useful for a future visual apartment view.

- `isoGrid.js` — isometric grid math
- `placement.js` — drag/place + collision logic
- `renderer.js` — canvas/DOM isometric renderer
- `roomBuilder.js` — room-builder controller that wired the above together
- `assetManifest.js` — sprite asset manifest (`G2_ASSETS`), paths assume an
  `assets/sprites/g2/transparent/...` folder at the repo root
- `itemCatalog.js` — placeable item definitions with sprite/footprint data
  (superseded by `src/apartment/apartmentItems.js`, which has no sprite
  positioning and is keyed on simple slots instead of grid footprints)
