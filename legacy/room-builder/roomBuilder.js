import { loadRoomLayout, saveRoomLayout } from "../state/storage.js";
import { getCatalogItem } from "./itemCatalog.js";
import { getOccupiedTiles, getOccupiedWallCells } from "./isoGrid.js";
import {
  canPlaceItem,
  canPlaceWallItem,
  deletePlacedItem,
  findTopItemAtTile,
  findWallItemAtCell,
  placeItem,
  placeWallItem,
  rotatePlacedItem,
} from "./placement.js";
import {
  renderGrid,
  renderInventory,
  renderItems,
  renderSelection,
  renderWallGrids,
  updateTileStates,
  updateWallCellStates,
} from "./renderer.js";

const DEFAULT_STATE = {
  items: [],
  selectedCatalogId: "coffin-bed",
  selectedUid: null,
  hoveredTile: null,
  hoveredWallCell: null,
  gridVisible: true,
  status: "Select an item, then click a tile.",
};

export class RoomBuilder {
  constructor(root) {
    this.root = root;
    this.state = {
      ...DEFAULT_STATE,
      items: normalizeLoadedItems(loadRoomLayout()),
    };
  }

  mount() {
    this.root.innerHTML = `
      <section class="apartment-builder">
        <aside class="builder-panel inventory">
          <h2 class="panel-title">Inventory</h2>
          <p class="inventory-meta">Prototype assets are placeholder pixel forms. Collision uses tile footprints.</p>
          <div class="inventory-list" data-inventory></div>
        </aside>

        <section class="room-stage-shell">
          <div class="stage-toolbar">
            <div>
              <h1>H10 Isometric Room</h1>
              <p>8x8 floor grid / left + right wall grids / local save slot</p>
            </div>
            <div class="stage-actions">
              <button class="btn" type="button" data-toggle-grid>Grid On</button>
              <button class="btn danger" type="button" data-clear-room>Clear Room</button>
            </div>
          </div>
          <div class="room-viewport">
            <div class="iso-scene">
              <div class="room-shell" aria-hidden="true">
                <div class="room-drop-shadow"></div>
                <div class="wall-plane wall-left"></div>
                <div class="wall-plane wall-right"></div>
                <div class="floor-plane"></div>
                <div class="floor-edge floor-edge-left"></div>
                <div class="floor-edge floor-edge-right"></div>
                <div class="floor-edge floor-edge-front"></div>
              </div>
              <div class="wall-grid" data-wall-grid></div>
              <div class="iso-grid" data-grid></div>
              <div class="iso-items" data-items></div>
            </div>
          </div>
        </section>

        <aside class="builder-panel controls" data-controls></aside>
      </section>
    `;

    this.inventoryEl = this.root.querySelector("[data-inventory]");
    this.wallGridEl = this.root.querySelector("[data-wall-grid]");
    this.gridEl = this.root.querySelector("[data-grid]");
    this.itemsEl = this.root.querySelector("[data-items]");
    this.controlsEl = this.root.querySelector("[data-controls]");
    this.clearButton = this.root.querySelector("[data-clear-room]");
    this.gridToggleButton = this.root.querySelector("[data-toggle-grid]");

    renderWallGrids(
      this.wallGridEl,
      (wall, cellX, cellY) => this.handleWallCellClick(wall, cellX, cellY),
      (wall, cellX, cellY) => this.handleWallCellHover(wall, cellX, cellY),
    );
    renderGrid(
      this.gridEl,
      (tileX, tileY) => this.handleTileClick(tileX, tileY),
      (tileX, tileY) => this.handleTileHover(tileX, tileY),
    );
    this.clearButton.addEventListener("click", () => this.clearRoom());
    this.gridToggleButton.addEventListener("click", () => this.toggleGrid());
    window.addEventListener("keydown", (event) => this.handleKeydown(event));

    this.render();
  }

  handleInventorySelect(itemId) {
    this.state.selectedCatalogId = itemId;
    this.state.selectedUid = null;
    const item = getCatalogItem(itemId);
    this.state.status = `${item?.name || "Item"} ready for ${item?.kind === "wall" ? "wall-cell" : "floor-tile"} placement.`;
    this.render();
  }

  handleTileClick(tileX, tileY) {
    const catalogItem = getCatalogItem(this.state.selectedCatalogId);
    if (catalogItem?.kind === "wall") {
      this.state.status = "That item belongs on a wall cell.";
      this.render();
      return;
    }

    const topItem = findTopItemAtTile(this.state.items, tileX, tileY);
    if (topItem) {
      this.state.selectedUid = topItem.uid;
      this.state.status = "Placed item selected.";
      this.render();
      return;
    }

    if (!catalogItem) return;

    const result = placeItem(this.state.items, catalogItem, tileX, tileY);
    if (!result.placedItem) {
      this.state.status = "Placement blocked by collision or room bounds.";
      this.render();
      return;
    }

    this.state.items = result.items;
    this.state.selectedUid = result.placedItem.uid;
    this.state.status = `${catalogItem.name} placed.`;
    this.persistAndRender();
  }

  handleTileHover(tileX, tileY) {
    this.state.hoveredTile = `${tileX}:${tileY}`;
    this.state.hoveredWallCell = null;
    this.updateTileOverlay();
  }

  handleWallCellClick(wall, cellX, cellY) {
    const catalogItem = getCatalogItem(this.state.selectedCatalogId);
    if (catalogItem?.kind !== "wall") {
      const topItem = findWallItemAtCell(this.state.items, wall, cellX, cellY);
      if (topItem) {
        this.state.selectedUid = topItem.uid;
        this.state.status = "Wall item selected.";
        this.render();
      } else {
        this.state.status = "Choose a wall item to place on wall cells.";
        this.render();
      }
      return;
    }

    const topItem = findWallItemAtCell(this.state.items, wall, cellX, cellY);
    if (topItem) {
      this.state.selectedUid = topItem.uid;
      this.state.status = "Wall item selected.";
      this.render();
      return;
    }

    const result = placeWallItem(this.state.items, catalogItem, wall, cellX, cellY);
    if (!result.placedItem) {
      this.state.status = "Wall placement blocked by collision or room bounds.";
      this.render();
      return;
    }

    this.state.items = result.items;
    this.state.selectedUid = result.placedItem.uid;
    this.state.status = `${catalogItem.name} placed on ${wall} wall.`;
    this.persistAndRender();
  }

  handleWallCellHover(wall, cellX, cellY) {
    this.state.hoveredWallCell = `${wall}:${cellX}:${cellY}`;
    this.state.hoveredTile = null;
    this.updateTileOverlay();
  }

  selectPlacedItem(uid) {
    this.state.selectedUid = uid;
    this.state.status = "Placed item selected.";
    this.render();
  }

  rotateSelected() {
    if (!this.state.selectedUid) return;
    const result = rotatePlacedItem(this.state.items, this.state.selectedUid);
    this.state.items = result.items;
    this.state.status = result.rotated ? "Item rotated." : "Rotation blocked.";
    this.persistAndRender();
  }

  deleteSelected() {
    if (!this.state.selectedUid) return;
    this.state.items = deletePlacedItem(this.state.items, this.state.selectedUid);
    this.state.selectedUid = null;
    this.state.status = "Item deleted.";
    this.persistAndRender();
  }

  clearRoom() {
    this.state.items = [];
    this.state.selectedUid = null;
    this.state.status = "Room cleared.";
    this.persistAndRender();
  }

  toggleGrid() {
    this.state.gridVisible = !this.state.gridVisible;
    this.state.status = this.state.gridVisible ? "Grid visible." : "Grid hidden. Placement previews still appear.";
    this.render();
  }

  handleKeydown(event) {
    if (event.key === "Delete" || event.key === "Backspace") {
      this.deleteSelected();
    }
    if (event.key.toLowerCase() === "r") {
      this.rotateSelected();
    }
  }

  persistAndRender() {
    saveRoomLayout(this.state.items);
    this.render();
  }

  render() {
    const scene = this.root.querySelector(".iso-scene");
    const activeItem = getCatalogItem(this.state.selectedCatalogId);
    scene?.classList.toggle("grid-hidden", !this.state.gridVisible);
    scene?.classList.toggle("wall-placement-active", activeItem?.kind === "wall");
    this.gridToggleButton.textContent = this.state.gridVisible ? "Grid On" : "Grid Off";
    renderInventory(this.inventoryEl, this.state.selectedCatalogId, (itemId) => this.handleInventorySelect(itemId));
    renderItems(this.itemsEl, this.state.items, this.state.selectedUid, (uid) => this.selectPlacedItem(uid));
    renderSelection(this.controlsEl, this.state, {
      onRotate: () => this.rotateSelected(),
      onDelete: () => this.deleteSelected(),
    });
    this.updateTileOverlay();
    this.renderStatus();
  }

  renderStatus() {
    let status = this.controlsEl.querySelector("[data-builder-status]");
    if (!status) {
      status = document.createElement("div");
      status.className = "status-line";
      status.dataset.builderStatus = "";
      this.controlsEl.appendChild(status);
    }
    status.textContent = this.state.status;
  }

  updateTileOverlay() {
    const occupiedTiles = new Set();
    const occupiedWallCells = new Set();
    const previewTiles = new Set();
    const previewWallCells = new Set();
    let floorValidity = null;
    let wallValidity = null;

    this.state.items.forEach((placedItem) => {
      const catalogItem = getCatalogItem(placedItem.itemId);
      if (!catalogItem) return;
      if ((placedItem.surface || "floor") === "wall") {
        getOccupiedWallCells(placedItem, catalogItem).forEach((cell) => {
          occupiedWallCells.add(`${cell.wall}:${cell.x}:${cell.y}`);
        });
      } else {
        getOccupiedTiles(placedItem, catalogItem).forEach((tile) => {
          occupiedTiles.add(`${tile.x}:${tile.y}`);
        });
      }
    });

    const activeItem = getCatalogItem(this.state.selectedCatalogId);
    if (activeItem?.kind !== "wall" && this.state.hoveredTile) {
      const [x, y] = this.state.hoveredTile.split(":").map(Number);
      const canPlace = canPlaceItem(this.state.items, activeItem, x, y);
      floorValidity = canPlace ? "valid" : "invalid";
      const preview = { itemId: activeItem.id, x, y, rotation: 0 };
      getOccupiedTiles(preview, activeItem).forEach((tile) => {
        previewTiles.add(`${tile.x}:${tile.y}`);
      });
    }

    if (activeItem?.kind === "wall" && this.state.hoveredWallCell) {
      const [wall, rawX, rawY] = this.state.hoveredWallCell.split(":");
      const x = Number(rawX);
      const y = Number(rawY);
      const canPlace = canPlaceWallItem(this.state.items, activeItem, wall, x, y);
      wallValidity = canPlace ? "valid" : "invalid";
      const preview = { itemId: activeItem.id, surface: "wall", wall, x, y, rotation: 0 };
      getOccupiedWallCells(preview, activeItem).forEach((cell) => {
        previewWallCells.add(`${cell.wall}:${cell.x}:${cell.y}`);
      });
    }

    updateTileStates(this.gridEl, occupiedTiles, previewTiles, this.state.hoveredTile, floorValidity);
    updateWallCellStates(this.wallGridEl, occupiedWallCells, previewWallCells, this.state.hoveredWallCell, wallValidity);
  }
}

function normalizeLoadedItems(items) {
  return items.map((item) => {
    const catalogItem = getCatalogItem(item.itemId);
    return {
      ...item,
      surface: item.surface || (catalogItem?.kind === "wall" ? "wall" : "floor"),
      wall: item.wall || null,
      rotation: item.rotation || 0,
    };
  });
}
