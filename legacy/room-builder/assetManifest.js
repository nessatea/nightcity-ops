export const ASSET_REQUIREMENTS = {
  productionFormat: "transparent PNG or WebP",
  note: "Production room sprites must be isolated transparent assets. Raw white-background sheet crops are source material only and should not be referenced by the app catalog.",
};

const BASE = "./assets/sprites/g2/transparent";

const defaults = {
  floor: { anchorX: 0.5, anchorY: 1, offsetX: 0, offsetY: 0 },
  wall: { anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0 },
};

function sprite(folder, file, spriteWidth, spriteHeight, options = {}) {
  const kindDefaults = defaults[options.kind || "floor"] || defaults.floor;
  return {
    src: `${BASE}/${folder}/${file}.png`,
    spriteWidth,
    spriteHeight,
    anchorX: options.anchorX ?? kindDefaults.anchorX,
    anchorY: options.anchorY ?? kindDefaults.anchorY,
    offsetX: options.offsetX ?? kindDefaults.offsetX,
    offsetY: options.offsetY ?? kindDefaults.offsetY,
    transparent: true,
  };
}

export const G2_ASSETS = {
  floor: {
    arcadeCabinetLeft: sprite("floor", "arcade_cabinet_left", 146, 176),
    arcadeCabinetRight: sprite("floor", "arcade_cabinet_right", 149, 177),
    bedCoffinLeft: sprite("floor", "bed_coffin_left", 230, 162),
    bedCoffinRight: sprite("floor", "bed_coffin_right", 220, 162),
    deskNetrunnerLeft: sprite("floor", "desk_netrunner_left", 200, 180),
    deskNetrunnerRight: sprite("floor", "desk_netrunner_right", 199, 180),
    kitchenCompactLeft: sprite("floor", "kitchen_compact_left", 206, 180),
    kitchenCompactRight: sprite("floor", "kitchen_compact_right", 210, 180),
    lampFloorNeonLeft: sprite("floor", "lamp_floor_neon_left", 186, 150),
    lampFloorNeonRight: sprite("floor", "lamp_floor_neon_right", 149, 150),
    loveseatMoxLeft: sprite("floor", "loveseat_mox_left", 219, 190),
    loveseatMoxRight: sprite("floor", "loveseat_mox_right", 217, 190),
    plantBiolumeLeft: sprite("floor", "plant_biolume_left", 119, 155),
    plantBiolumeRight: sprite("floor", "plant_biolume_right", 120, 155),
    rugCircuitLeft: sprite("floor", "rug_circuit_left", 233, 190, { offsetY: 8 }),
    rugCircuitRight: sprite("floor", "rug_circuit_right", 234, 190, { offsetY: 8 }),
  },
  wall: {
    katanaLeft: sprite("wall", "katana_wall_leftwall", 209, 116, { kind: "wall" }),
    katanaRight: sprite("wall", "katana_wall_rightwall", 210, 117, { kind: "wall" }),
    panelFront: sprite("wall", "panel_holo_front", 114, 107, { kind: "wall" }),
    panelLeft: sprite("wall", "panel_holo_leftwall", 126, 150, { kind: "wall" }),
    panelRight: sprite("wall", "panel_holo_rightwall", 119, 153, { kind: "wall" }),
    posterHoloFront: sprite("wall", "poster_holo_front", 105, 198, { kind: "wall" }),
    posterHoloLeft: sprite("wall", "poster_holo_leftwall", 140, 199, { kind: "wall" }),
    posterHoloRight: sprite("wall", "poster_holo_rightwall", 91, 199, { kind: "wall" }),
    posterSamuraiFront: sprite("wall", "poster_samurai_front", 129, 193, { kind: "wall" }),
    posterSamuraiLeft: sprite("wall", "poster_samurai_leftwall", 107, 197, { kind: "wall" }),
    posterSamuraiRight: sprite("wall", "poster_samurai_rightwall", 108, 197, { kind: "wall" }),
    shelfLeft: sprite("wall", "shelf_wall_leftwall", 159, 154, { kind: "wall" }),
    shelfRight: sprite("wall", "shelf_wall_rightwall", 185, 155, { kind: "wall" }),
    signFront: sprite("wall", "sign_neon_front", 136, 94, { kind: "wall" }),
    signLeft: sprite("wall", "sign_neon_leftwall", 188, 145, { kind: "wall" }),
    signRight: sprite("wall", "sign_neon_rightwall", 195, 145, { kind: "wall" }),
    windowCityFront: sprite("wall", "window_city_front", 134, 191, { kind: "wall" }),
    windowCityLeft: sprite("wall", "window_city_leftwall", 129, 200, { kind: "wall" }),
    windowCityRight: sprite("wall", "window_city_rightwall", 141, 200, { kind: "wall" }),
    windowRainFront: sprite("wall", "window_rain_front", 145, 191, { kind: "wall" }),
    windowRainLeft: sprite("wall", "window_rain_leftwall", 102, 195, { kind: "wall" }),
    windowRainRight: sprite("wall", "window_rain_rightwall", 155, 200, { kind: "wall" }),
  },
  floating: {
    clockHolo: sprite("floating", "clock_holo", 111, 131, { offsetY: -10 }),
    drone: sprite("floating", "drone_floating", 87, 125, { offsetY: -14 }),
  },
};
