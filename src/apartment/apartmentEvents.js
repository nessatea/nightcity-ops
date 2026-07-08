// Ambient apartment events: small flavor moments rolled by
// apartmentState.checkDailyEvent(), at most once per day. Mostly texture —
// a tiny eddies swing either way, or nothing at all. Not tied to vibe score
// or visitors; these are just "your apartment exists in a city" moments.
//
// To add one: append an object with a unique id, flavor text, and an
// eddies delta (0 for pure flavor, small positive/negative otherwise).
// Keep bad/negative entries rare and small — see EVENT_CATALOG below,
// weighted roughly 4 good / 8 neutral / 3 bad.
export const EVENT_CATALOG = [
  { id: "couch-eddies", text: "Found loose eddies wedged in the couch cushions.", eddies: 15 },
  { id: "overpay-refund", text: "A courier left an overpayment refund in your account by mistake. You're keeping it.", eddies: 20 },
  { id: "fixer-quick-sale", text: "Sold some old gear to a fixer passing through the building. Quick, clean, small.", eddies: 18 },
  { id: "gift-at-door", text: "Someone left a small gift at your door. No note, no explanation.", eddies: 10 },

  { id: "power-flicker", text: "Power flickers for a second, then steadies. Nothing lost.", eddies: 0 },
  { id: "neighbor-bassline", text: "A neighbor's music bleeds through the wall all night. The bassline slaps, unfortunately.", eddies: 0 },
  { id: "rig-reboot", text: "Your netrunner rig glitches and reboots itself. Mildly concerning, ultimately fine.", eddies: 0 },
  { id: "stray-cat", text: "A stray cat sits on your windowsill for a while, then leaves without explanation.", eddies: 0 },
  { id: "gig-flyer", text: "Someone slid a flyer for a gig under your door. You're not taking it. Probably.", eddies: 0 },
  { id: "av-rattle", text: "The building AV pad rattles as something lands nearby. Not your problem tonight.", eddies: 0 },
  { id: "lost-charger", text: "You misplace a charger cable. You'll find it in an unrelated drawer in three weeks.", eddies: 0 },
  { id: "rain-window", text: "Rain against the window all night. Extremely good sleeping weather.", eddies: 0 },

  { id: "vending-eats-eddies", text: "A vending machine on your floor eats your eddies and gives nothing back.", eddies: -10 },
  { id: "maintenance-bill", text: "Building maintenance bills you for a repair you don't remember requesting.", eddies: -12 },
  { id: "borrowed-charger", text: "Someone \"borrowed\" your charger and did not return it. Replacement cost.", eddies: -8 },
];

export function rollEvent() {
  return EVENT_CATALOG[Math.floor(Math.random() * EVENT_CATALOG.length)];
}
