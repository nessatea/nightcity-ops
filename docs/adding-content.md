# Adding content

This app is built so new content is additive — append to a catalog array,
nothing else needs to change. Every list below names the exact file and
gives the minimal shape to copy.

## Apartment items (Market tab)

File: [`src/apartment/apartmentItems.js`](../src/apartment/apartmentItems.js)

Append an object to `APARTMENT_ITEMS`:

```js
{
  id: "unique-kebab-id",
  name: "Display Name",
  icon: "🪑",
  compatibleSlot: "lounge", // one of APARTMENT_SLOTS
  category: "seating",
  rarity: "common" | "uncommon" | "rare",
  price: 150,
  vibes: { comfort: 2, style: 1 }, // keys from VIBE_KEYS in vibeScore.js, 1-4 each
  desc: "One short line of flavor text.",
  allowMultiples: false,
}
```

Nothing else needs updating — the market shelf, equip slots, vibe totals,
and visitor rating all read this array directly.

## VIP visitors (OCs)

1. Add/confirm the character's profile in [`docs/oc-directory.md`](oc-directory.md)
   (source: `oc_directory.docx` / `oc_directory2.docx` — check the latter first).
2. Infer `likes`/`dislikes`/`favoriteSlots` from their role + traits — the
   archetype guidance is in that doc (corporate → luxury/tech, ripperdocs →
   practical/tech/comfort, musicians → music/cozy/lounge, etc).
3. Append to `VIP_VISITORS` in [`src/apartment/visitors.js`](../src/apartment/visitors.js)
   with a unique id and four short dialogue lines (loved/liked/neutral/disliked).

Random (non-VIP) visitors follow the same shape with `visitorType: "random"` —
append to `RANDOM_VISITORS` in the same file.

## Contracts (Gigs tab)

File: [`src/core/contracts.js`](../src/core/contracts.js)

Append an object to the array returned by `contractDefs()`:

```js
{ id: "unique-id", scope: "DAILY" | "WEEKLY", key: d /* or w */,
  title: "Contract Name", fixer: "FIXER NAME", desc: "What to do.",
  progress: /* however you compute it */, goal: 1, xp: 20, ed: 15 }
```

`progress`/`goal` can read from anything `core` (the `CoreState` instance)
exposes — `core.state.today.done`, `core.fullDaysLast(7)`,
`core.attrStats()`, etc. If you want a contract tied to apartment/visitor
activity, `core.state.visitorInviteDates` and `core.state.apartmentPurchaseDates`
are logged automatically by `apartmentState.js` — use
`core.countDatesLast(dates, 1)` for "today" or `core.countDatesLast(dates, 7)`
for "this week". Keep rewards in line with the existing scale (~10-25 xp/ed
for daily, ~40-75 for weekly) so nothing outpaces the habit-tracker loop.

## Ambient apartment events

File: [`src/apartment/apartmentEvents.js`](../src/apartment/apartmentEvents.js)

Append an object to `EVENT_CATALOG`:

```js
{ id: "unique-id", text: "One line of flavor.", eddies: 0 } // or a small +/- number
```

Events roll at most once per day (45% chance) on first visit to the
Apartment tab. Keep negative `eddies` values small and rare — the catalog
is weighted roughly 4 good / 8 neutral / 3 bad; match that ratio when
adding more so it stays a nice surprise rather than a tax.

## Cyberware upgrades (Gigs tab)

File: [`src/core/constants.js`](../src/core/constants.js), `UPGRADES` array.
Same shape as apartment items but with a `lvl` requirement instead of a slot.

## Default synced apps (Console tab)

File: [`src/core/constants.js`](../src/core/constants.js), `DEFAULT_APPS` —
only affects new installs; existing players add/edit/remove their own via
the Config tab (Settings → Sync Queue).

## Training program (Training tab)

File: [`src/core/constants.js`](../src/core/constants.js), `WORKOUT_PROGRAM` —
keyed by rotation slot (`"1A"`, `"1B"`, `"2"`, `"3"`, `"4"`). Add a new key
and also add it to `TRAINING_CYCLE`/`TRAINING_PICKER_OPTIONS` if it should
join the automatic rotation, or leave it picker-only.
