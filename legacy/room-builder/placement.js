import { getCatalogItem } from "./itemCatalog.js";
import {
  getDepthForItem,
  getFootprint,
  getOccupiedTiles,
  getOccupiedWallCells,
  isInsideGrid,
  isInsideWallGrid,
} from "./isoGrid.js";

export function createPlacedItem(catalogItem, tileX, tileY, options = {}) {
  return {
    uid: createId(),
    itemId: catalogItem.id,
    surface: catalogItem.kind === "wall" ? "wall" : "floor",
    wall: options.wall || null,
    x: tileX,
    y: tileY,
    rotation: 0,
  };
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function canPlaceItem(items, catalogItem, tileX, tileY, rotation = 0, ignoredUid = null) {
  if (catalogItem.kind === "wall") return false;

  const candidate = { itemId: catalogItem.id, x: tileX, y: tileY, rotation };
  const candidateTiles = getOccupiedTiles(candidate, catalogItem);

  if (candidateTiles.some((tile) => !isInsideGrid(tile.x, tile.y))) {
    return false;
  }

  const occupied = new Set();
  items
    .filter((item) => item.uid !== ignoredUid && (item.surface || "floor") === "floor")
    .forEach((item) => {
      const existingCatalogItem = getCatalogItem(item.itemId);
      if (!existingCatalogItem) return;
      getOccupiedTiles(item, existingCatalogItem).forEach((tile) => {
        occupied.add(`${tile.x}:${tile.y}`);
      });
    });

  return candidateTiles.every((tile) => !occupied.has(`${tile.x}:${tile.y}`));
}

export function canPlaceWallItem(items, catalogItem, wall, cellX, cellY, ignoredUid = null) {
  if (catalogItem.kind !== "wall") return false;

  const candidate = { itemId: catalogItem.id, surface: "wall", wall, x: cellX, y: cellY, rotation: 0 };
  const candidateCells = getOccupiedWallCells(candidate, catalogItem);

  if (candidateCells.some((cell) => !isInsideWallGrid(cell.x, cell.y))) {
    return false;
  }

  const occupied = new Set();
  items
    .filter((item) => item.uid !== ignoredUid && (item.surface || "floor") === "wall")
    .forEach((item) => {
      const existingCatalogItem = getCatalogItem(item.itemId);
      if (!existingCatalogItem) return;
      getOccupiedWallCells(item, existingCatalogItem).forEach((cell) => {
        occupied.add(`${cell.wall}:${cell.x}:${cell.y}`);
      });
    });

  return candidateCells.every((cell) => !occupied.has(`${cell.wall}:${cell.x}:${cell.y}`));
}

export function placeItem(items, catalogItem, tileX, tileY) {
  if (!canPlaceItem(items, catalogItem, tileX, tileY)) {
    return { items, placedItem: null };
  }

  const placedItem = createPlacedItem(catalogItem, tileX, tileY);
  return { items: [...items, placedItem], placedItem };
}

export function placeWallItem(items, catalogItem, wall, cellX, cellY) {
  if (!canPlaceWallItem(items, catalogItem, wall, cellX, cellY)) {
    return { items, placedItem: null };
  }

  const placedItem = createPlacedItem(catalogItem, cellX, cellY, { wall });
  return { items: [...items, placedItem], placedItem };
}

export function rotatePlacedItem(items, uid) {
  const target = items.find((item) => item.uid === uid);
  if (!target) return { items, rotated: false };

  const catalogItem = getCatalogItem(target.itemId);
  if (!catalogItem?.rotatable) return { items, rotated: false };
  if ((target.surface || "floor") === "wall") return { items, rotated: false };

  const nextRotation = (target.rotation + 90) % 360;
  if (!canPlaceItem(items, catalogItem, target.x, target.y, nextRotation, uid)) {
    return { items, rotated: false };
  }

  return {
    items: items.map((item) => (item.uid === uid ? { ...item, rotation: nextRotation } : item)),
    rotated: true,
  };
}

export function deletePlacedItem(items, uid) {
  return items.filter((item) => item.uid !== uid);
}

export function findTopItemAtTile(items, tileX, tileY) {
  return [...items]
    .map((item) => ({ item, catalogItem: getCatalogItem(item.itemId) }))
    .filter(({ catalogItem }) => catalogItem)
    .filter(({ item }) => (item.surface || "floor") === "floor")
    .filter(({ item, catalogItem }) => {
      return getOccupiedTiles(item, catalogItem).some((tile) => tile.x === tileX && tile.y === tileY);
    })
    .sort((a, b) => getDepthForItem(b.item, b.catalogItem) - getDepthForItem(a.item, a.catalogItem))[0]?.item || null;
}

export function findWallItemAtCell(items, wall, cellX, cellY) {
  return [...items]
    .map((item) => ({ item, catalogItem: getCatalogItem(item.itemId) }))
    .filter(({ catalogItem }) => catalogItem)
    .filter(({ item }) => (item.surface || "floor") === "wall")
    .filter(({ item, catalogItem }) => {
      return getOccupiedWallCells(item, catalogItem).some((cell) => cell.wall === wall && cell.x === cellX && cell.y === cellY);
    })
    .sort((a, b) => getDepthForItem(b.item, b.catalogItem) - getDepthForItem(a.item, a.catalogItem))[0]?.item || null;
}

export function summarizeFootprint(item, rotation = 0) {
  const footprint = getFootprint(item, rotation);
  return `${footprint.w}x${footprint.h}`;
}
