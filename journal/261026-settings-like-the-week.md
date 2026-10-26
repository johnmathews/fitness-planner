# A Settings page like the week

> Purpose: why the Settings page went full width in rows, how its controls take the page's size,
> and how the change was checked.

## 1. The ask

The Settings page was a 576px column at the system's small fixed sizes. It sat under a bar and
beside a week that are now full width and big. John: "it is needlessly narrow. lets make its
design language fit with the rest of the app".

## 2. The decision

The mockup `brand/design-system/mockups/261026-settings-page` showed two layouts beside the
shipped page. John picked A, rows like the week (K51):

- The page spans the window on the 48u margins, and every size comes from `u`.
- Each section is a row. Its heading sits in the week's 320u name column, and its settings sit to
  the right.
- The title uses the section titles' 40u serif. Headings are 27u, and labels, text and buttons
  are 19u. Controls are 60u tall.
- The mark sets are tiles, three to a row, with 60u marks.
- Folded, the page is one column at the system's sizes.

Round 2, from John's notes on the built page:

- **K52:** the Settings page has no bar. The bar held only the wordmark, so the page now starts
  with its own link back to the week. `App.vue` leaves `AppNavbar` off the page, and the bar
  lost its `page` prop.
- **K53:** Export and Import… sit beside the data line, held to 34ch, and Sign out sits beside
  "Signed in as", as the Stepper sits beside its label. On a phone they wrap under the words.

## 3. How it is built

- `main.css` holds the page's sizes as `--set-*`, beside the planner's.
- An unlayered block in `main.css` gives the SegmentedControl, Stepper, Button and RadioCard
  the page's sizes. It is scoped to `[data-slot='settings-page']` and keys on their own
  `data-slot` names. Unlayered rules beat the primitives' fixed utilities, so the primitives and
  their cards stay unchanged everywhere else.
- A dialog the page opens is teleported out of it and keeps the system's sizes.
- The lint rule against unknown classes ruled out a `.settings-page` class, so the page carries
  a `data-slot`.
- `App.vue` drops the centred 1152px column for the Settings page only.
- The DayMark drawing is a fixed 60px. The page sizes it to 94% of its 60u box, as the
  SettingsPage card's preview does.

## 4. Checked

The design gate, the unit tests, lint, type-check and the end-to-end tests passed. In the
running app no width scrolls sideways. The segments are 88px tall at 1920×1200, 58px at
1280×800 and 46px on a 390px phone. Folded sections stretch to the full width; `items-start`
from the row grid had shrunk them on a phone until `folded:items-stretch` fixed it.
