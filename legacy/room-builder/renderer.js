import { ITEM_CATALOG, getCatalogItem } from "./itemCatalog.js";
import {
  GRID_SIZE,
  TILE_HEIGHT,
  TILE_WIDTH,
  WALL_CELL_HEIGHT,
  WALL_CELL_WIDTH,
  WALL_COLUMNS,
  WALL_ROWS,
  getDepthForItem,
  getFootprint,
  tileToScreen,
  wallCellToScreen,
} from "./isoGrid.js";
import { summarizeFootprint } from "./placement.js";

export function renderInventory(container, selectedCatalogId, onSelect) {
  container.innerHTML = ITEM_CATALOG.map((item) => {
    const asset = assetForItem(item, { rotation: 0, wall: "left" });
    return `
      <button class="inventory-card ${selectedCatalogId === item.id ? "is-active" : ""}" type="button" data-item-id="${item.id}">
        ${asset ? `<img class="mini-sprite-img" src="${asset.src}" alt="" loading="lazy">` : `<span class="mini-sprite" style="${spriteVars(item)}"></span>`}
        <span>
          <b>${item.name}</b>
          <span>${item.kind} / ${item.layer} / ${summarizeFootprint(item)}</span>
        </span>
      </button>
    `;
  }).join("");

  container.querySelectorAll("[data-item-id]").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.itemId));
  });
}

export function renderWallGrids(container, onWallCellClick, onWallCellHover) {
  const cells = [];
  ["left", "right"].forEach((wall) => {
    for (let y = 0; y < WALL_ROWS; y += 1) {
      for (let x = 0; x < WALL_COLUMNS; x += 1) {
        const point = wallCellToScreen(wall, x, y);
        cells.push(`
          <button class="wall-cell wall-${wall}" type="button" data-wall="${wall}" data-x="${x}" data-y="${y}"
            style="--wall-cell-w:${WALL_CELL_WIDTH}px;--wall-cell-h:${WALL_CELL_HEIGHT}px;left:${point.x}px;top:${point.y}px"
            aria-label="${wall} wall cell ${x + 1}, ${y + 1}"></button>
        `);
      }
    }
  });

  container.innerHTML = cells.join("");
  container.querySelectorAll(".wall-cell").forEach((cell) => {
    cell.addEventListener("click", () => onWallCellClick(cell.dataset.wall, Number(cell.dataset.x), Number(cell.dataset.y)));
    cell.addEventListener("pointerenter", () => onWallCellHover(cell.dataset.wall, Number(cell.dataset.x), Number(cell.dataset.y)));
  });
}

export function renderGrid(container, onTileClick, onTileHover) {
  const tiles = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const point = tileToScreen(x, y);
      tiles.push(`
        <button class="iso-tile" type="button" data-x="${x}" data-y="${y}"
          style="--tile-w:${TILE_WIDTH}px;--tile-h:${TILE_HEIGHT}px;left:${point.x}px;top:${point.y}px"
          aria-label="Tile ${x + 1}, ${y + 1}"></button>
      `);
    }
  }

  container.innerHTML = tiles.join("");
  container.querySelectorAll(".iso-tile").forEach((tile) => {
    tile.addEventListener("click", () => onTileClick(Number(tile.dataset.x), Number(tile.dataset.y)));
    tile.addEventListener("pointerenter", () => onTileHover(Number(tile.dataset.x), Number(tile.dataset.y)));
  });
}

export function renderItems(container, items, selectedUid, onSelect) {
  const sorted = [...items].sort((a, b) => {
    const itemA = getCatalogItem(a.itemId);
    const itemB = getCatalogItem(b.itemId);
    if (!itemA || !itemB) return 0;
    const layerA = layerRank(itemA);
    const layerB = layerRank(itemB);
    if (layerA !== layerB) return layerA - layerB;
    return getDepthForItem(a, itemA) - getDepthForItem(b, itemB);
  });

  container.innerHTML = sorted.map((placedItem, index) => {
    const catalogItem = getCatalogItem(placedItem.itemId);
    if (!catalogItem) return "";
    const isWall = (placedItem.surface || "floor") === "wall" || catalogItem.kind === "wall";
    const footprint = getFootprint(catalogItem, placedItem.rotation);
    const point = isWall
      ? wallCellToScreen(placedItem.wall || "left", placedItem.x, placedItem.y)
      : tileToScreen(
        placedItem.x + (footprint.w - 1) / 2,
        placedItem.y + (footprint.h - 1) / 2,
      );
    const depth = getDepthForItem(placedItem, catalogItem);
    const sprite = catalogItem.spriteByRotation?.[String(placedItem.rotation)] || catalogItem.sprite;
    const layer = catalogItem.layer || "furniture";
    const asset = assetForItem(catalogItem, placedItem);
    const width = asset?.spriteWidth || asset?.w || (isWall ? 110 : 104);
    const height = asset?.spriteHeight || asset?.h || (isWall ? 90 : 96);
    const anchorX = asset?.anchorX ?? catalogItem.anchorX ?? (isWall ? 0.5 : 0.5);
    const anchorY = asset?.anchorY ?? catalogItem.anchorY ?? (isWall ? 0.5 : 1);
    const offsetX = (asset?.offsetX ?? catalogItem.offsetX ?? 0);
    const offsetY = (asset?.offsetY ?? catalogItem.offsetY ?? 0);
    const anchorShiftX = Math.round((-width * anchorX) + offsetX);
    const anchorShiftY = Math.round((-height * anchorY) + offsetY);
    return `
      <button class="room-item layer-${layer} ${isWall ? "is-wall-item" : "is-floor-item"} ${asset ? "has-image" : "has-css-sprite"} ${selectedUid === placedItem.uid ? "is-selected" : ""}" type="button"
        data-uid="${placedItem.uid}"
        style="left:${point.x}px;top:${point.y}px;z-index:${layerZ(layer) + depth * 10 + index};--item-w:${width}px;--item-h:${height}px;--anchor-shift-x:${anchorShiftX}px;--anchor-shift-y:${anchorShiftY}px;"
        aria-label="${catalogItem.name}">
        ${isWall ? "" : '<span class="room-item-shadow"></span>'}
        ${asset
          ? `<img class="room-item-img" src="${asset.src}" alt="" loading="lazy">`
          : `<span class="room-item-art sprite-${sprite}" style="${spriteVars(catalogItem)} transform: rotateY(${placedItem.rotation === 90 || placedItem.rotation === 270 ? "180deg" : "0deg"});"></span>`}
      </button>
    `;
  }).join("");

  container.querySelectorAll("[data-uid]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onSelect(button.dataset.uid);
    });
  });
}

export function renderSelection(container, state, callbacks) {
  const selectedPlacedItem = state.items.find((item) => item.uid === state.selectedUid);
  const selectedCatalogItem = selectedPlacedItem ? getCatalogItem(selectedPlacedItem.itemId) : null;
  const activeCatalogItem = getCatalogItem(state.selectedCatalogId);
  const surfaceLabel = selectedPlacedItem?.surface === "wall" ? `${selectedPlacedItem.wall} wall cell` : "Tile";

  if (!selectedCatalogItem) {
    container.innerHTML = `
      <h2 class="panel-title">Selected Item</h2>
      <div class="selection-card">
        <div class="selection-empty">No placed item selected. Pick an inventory item, then click a floor tile or wall cell that accepts it.</div>
      </div>
      <h2 class="panel-title">Placement Intent</h2>
      <div class="selection-card">
        <b class="selected-item-name">${activeCatalogItem?.name || "None"}</b>
        <span class="selected-item-meta">${activeCatalogItem ? `${activeCatalogItem.kind} / ${activeCatalogItem.layer} / ${summarizeFootprint(activeCatalogItem)}` : "Choose from inventory"}</span>
        <p class="control-note">${activeCatalogItem?.description || "Inventory items appear in the left panel."}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <h2 class="panel-title">Selected Item</h2>
    <div class="selection-card">
      <b class="selected-item-name">${selectedCatalogItem.name}</b>
      <span class="selected-item-meta">${surfaceLabel} ${selectedPlacedItem.x + 1}, ${selectedPlacedItem.y + 1} / ${selectedCatalogItem.layer} / ${summarizeFootprint(selectedCatalogItem, selectedPlacedItem.rotation)} / ${selectedPlacedItem.rotation} deg</span>
      <p class="control-note">${selectedCatalogItem.description}</p>
    </div>
    <div class="control-stack">
      <button class="btn primary" type="button" data-action="rotate" ${selectedCatalogItem.rotatable && selectedCatalogItem.kind !== "wall" ? "" : "disabled"}>Rotate</button>
      <button class="btn danger" type="button" data-action="delete">Delete</button>
    </div>
    <div class="status-line">Floor items rotate in 90 degree steps. Wall items snap to wall cells.</div>
  `;

  container.querySelector('[data-action="rotate"]')?.addEventListener("click", callbacks.onRotate);
  container.querySelector('[data-action="delete"]')?.addEventListener("click", callbacks.onDelete);
}

export function updateTileStates(gridContainer, occupiedTiles, previewTiles, hoveredTile, placementValidity) {
  gridContainer.querySelectorAll(".iso-tile").forEach((tile) => {
    const key = `${tile.dataset.x}:${tile.dataset.y}`;
    tile.classList.toggle("is-occupied", occupiedTiles.has(key));
    tile.classList.toggle("is-preview", previewTiles.has(key));
    tile.classList.toggle("is-valid", previewTiles.has(key) && placementValidity === "valid");
    tile.classList.toggle("is-invalid", previewTiles.has(key) && placementValidity === "invalid");
    tile.classList.toggle("is-hovered", hoveredTile === key);
  });
}

export function updateWallCellStates(wallGridContainer, occupiedCells, previewCells, hoveredCell, placementValidity) {
  wallGridContainer.querySelectorAll(".wall-cell").forEach((cell) => {
    const key = `${cell.dataset.wall}:${cell.dataset.x}:${cell.dataset.y}`;
    cell.classList.toggle("is-occupied", occupiedCells.has(key));
    cell.classList.toggle("is-preview", previewCells.has(key));
    cell.classList.toggle("is-valid", previewCells.has(key) && placementValidity === "valid");
    cell.classList.toggle("is-invalid", previewCells.has(key) && placementValidity === "invalid");
    cell.classList.toggle("is-hovered", hoveredCell === key);
  });
}

function layerRank(item) {
  return {
    wall: 1,
    floorOverlay: 2,
    furniture: 3,
    floating: 4,
  }[item.layer || "furniture"] || 3;
}

function layerZ(layer) {
  return {
    wall: 40,
    floorOverlay: 90,
    furniture: 140,
    floating: 520,
  }[layer] || 140;
}

function spriteVars(item) {
  return `--c1:${item.colors[0]};--c2:${item.colors[1]};--c3:${item.colors[2]};`;
}

function assetForItem(item, placedItem) {
  if (item.kind === "wall" && item.assetByWall) {
    return item.assetByWall[placedItem.wall] || item.assetByWall.left || item.assetByWall.right || item.assetByWall.front || null;
  }

  return item.assetByRotation?.[String(placedItem.rotation || 0)] || item.assetByRotation?.["0"] || null;
}
