export const ROOM_STORAGE_KEY = "nightcity_ops_phase_g1_room";
export const APARTMENT_STORAGE_KEY = "nightcity_ops_apartment_visitors_v1";
export const CORE_STORAGE_KEY = "nightcity_ops_core_v1";

export function loadRoomLayout() {
  try {
    const raw = localStorage.getItem(ROOM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch (error) {
    console.warn("Room layout could not be loaded.", error);
    return [];
  }
}

export function saveRoomLayout(items) {
  localStorage.setItem(
    ROOM_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      savedAt: new Date().toISOString(),
      items,
    }),
  );
}

export function clearRoomLayout() {
  localStorage.removeItem(ROOM_STORAGE_KEY);
}

export function loadApartmentState(defaultState) {
  try {
    const raw = localStorage.getItem(APARTMENT_STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      ownedItems: { ...defaultState.ownedItems, ...(parsed.ownedItems || {}) },
      equippedSlots: { ...defaultState.equippedSlots, ...(parsed.equippedSlots || {}) },
      visitorAffinity: { ...defaultState.visitorAffinity, ...(parsed.visitorAffinity || {}) },
      wallet: { ...defaultState.wallet, ...(parsed.wallet || {}) },
    };
  } catch (error) {
    console.warn("Apartment state could not be loaded.", error);
    return structuredClone(defaultState);
  }
}

export function saveApartmentState(state) {
  localStorage.setItem(
    APARTMENT_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      ownedItems: state.ownedItems,
      equippedSlots: state.equippedSlots,
      visitorAffinity: state.visitorAffinity,
      selectedVisitorId: state.selectedVisitorId,
      lastVisitorResult: state.lastVisitorResult,
    }),
  );
}

export function loadCoreState(defaultState) {
  try {
    const raw = localStorage.getItem(CORE_STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch (error) {
    console.warn("Core state could not be loaded.", error);
    return structuredClone(defaultState);
  }
}

export function saveCoreState(state) {
  localStorage.setItem(CORE_STORAGE_KEY, JSON.stringify(state));
}
