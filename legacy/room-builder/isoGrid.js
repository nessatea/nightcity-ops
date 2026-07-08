export const GRID_SIZE = 8;
export const WALL_COLUMNS = 8;
export const WALL_ROWS = 4;
export const TILE_WIDTH = 72;
export const TILE_HEIGHT = 36;
export const ORIGIN_X = 430;
export const ORIGIN_Y = 86;
export const WALL_CELL_WIDTH = 36;
export const WALL_CELL_HEIGHT = 34;

export function tileToScreen(tileX, tileY) {
  return {
    x: ORIGIN_X + (tileX - tileY) * (TILE_WIDTH / 2),
    y: ORIGIN_Y + (tileX + tileY) * (TILE_HEIGHT / 2),
  };
}

export function screenToTile(screenX, screenY) {
  const dx = screenX - ORIGIN_X;
  const dy = screenY - ORIGIN_Y;
  return {
    x: Math.floor((dy / (TILE_HEIGHT / 2) + dx / (TILE_WIDTH / 2)) / 2),
    y: Math.floor((dy / (TILE_HEIGHT / 2) - dx / (TILE_WIDTH / 2)) / 2),
  };
}

export function isInsideGrid(tileX, tileY) {
  return tileX >= 0 && tileY >= 0 && tileX < GRID_SIZE && tileY < GRID_SIZE;
}

export function getFootprint(item, rotation = 0) {
  const keyed = item.footprintByRotation?.[String(rotation)];
  if (keyed) return keyed;

  const width = keyed?.w || item.footprint?.w || 1;
  const height = keyed?.h || item.footprint?.h || 1;
  return rotation % 180 === 0 ? { w: width, h: height } : { w: height, h: width };
}

export function getOccupiedTiles(placedItem, catalogItem) {
  const footprint = getFootprint(catalogItem, placedItem.rotation);
  const tiles = [];
  for (let x = 0; x < footprint.w; x += 1) {
    for (let y = 0; y < footprint.h; y += 1) {
      tiles.push({ x: placedItem.x + x, y: placedItem.y + y });
    }
  }
  return tiles;
}

export function getDepthForItem(placedItem, catalogItem) {
  if (placedItem.surface === "wall" || catalogItem.kind === "wall") {
    return placedItem.y * WALL_COLUMNS + placedItem.x;
  }

  const footprint = getFootprint(catalogItem, placedItem.rotation);
  return (placedItem.x + footprint.w - 1) + (placedItem.y + footprint.h - 1);
}

export function wallCellToScreen(wall, cellX, cellY) {
  const baseX = wall === "left" ? 286 : 574;
  const baseY = 118;
  const slant = wall === "left" ? -18 : 18;

  return {
    x: baseX + cellX * WALL_CELL_WIDTH + cellY * slant,
    y: baseY + cellY * WALL_CELL_HEIGHT + cellX * 2,
  };
}

export function isInsideWallGrid(cellX, cellY) {
  return cellX >= 0 && cellY >= 0 && cellX < WALL_COLUMNS && cellY < WALL_ROWS;
}

export function getWallFootprint(item) {
  return item.wallFootprint || item.footprint || { w: 1, h: 1 };
}

export function getOccupiedWallCells(placedItem, catalogItem) {
  const footprint = getWallFootprint(catalogItem);
  const cells = [];
  for (let x = 0; x < footprint.w; x += 1) {
    for (let y = 0; y < footprint.h; y += 1) {
      cells.push({ wall: placedItem.wall || "left", x: placedItem.x + x, y: placedItem.y + y });
    }
  }
  return cells;
}
