# A bigger bar

**Question:** the bar over the planner is small and thin under a bold week. It goes full width on
the page's margins and grows with the screen. Two questions: do its actions show their icons
over their names or beside them, and is Edit plan a pencil tile or a switch? How the bar hides
and comes back (K25), and what it holds, stay as they are.

**Status:** decided (2026-10-26, three rounds)

**Link:** https://claude.ai/artifact/JATY5PwARR4W6sBG7hLGX2 (private)

The screens are live (`proto.js`, `proto.css`, from the 261026 row-name-text prototype, with
K46's rows). `icons.js` holds the Lucide icons and the wordmark, generated from `@lucide/vue` and
`src/components/ui/brand-mark/wordmark.ts`. `try.html` shows them full size, with a switch for
each option, the week and the theme.

## Options

Every option: the bar spans the full width on the page's 48u margins (now it is centred in
1152px), the wordmark is 32u tall, and the week label is 26u at 600 between 32u arrows in 60u
targets. Everything scales with `u`, so the bar is 108px tall at 1280×800 and 163px at
1920×1200 (56px now). On a phone the wordmark stays out, the week takes the first row and the
actions share the second.

### 1. The actions

- **A. Icons over their names.** A tile per action: a 32u icon over its name in 17u, 600; tiles
  at least 96u wide. Recommended: it's the owner's suggestion, and it gives the most substantial
  icons.
- **B. Icons beside their names.** A 28u icon, then its name at 19u, 600; 133px tall at
  1920×1200. On a phone it stacks like A.

### 2. Edit plan

- **A. A pencil tile, filled when on.** `aria-pressed`, with the selected segment's ink fill.
  Recommended: one shape for every action, and the clearest "on" in the bar.
- **B. A switch over its name.** The Switch card drawn at the icon's size in the icon's place.

## Decision

John picked **A** for both on 2026-10-26: icons over their names (K47) and a pencil tile for
Edit plan (K48), in [decisions.md](../../../../docs/decisions.md). The ask was "it should be
thicker, and its icons more substantial ... lets display icons along with their tile. the title
could be below the icon". In round 3 John picked **A** for where Edit plan sits: with the
actions, just left of Settings, with "This week" beside the week's arrows (K50).

## Rounds

- **1, 2026-10-26:** the shipped bar beside A and B, and the two ways to show Edit plan.
- **2, 2026-10-26:** from John's comments on the page, Edit plan moved just right of the wordmark
  and Full screen to the far right (K49).
- **3, 2026-10-26:** John wasn't happy with Edit plan beside the wordmark and asked where it
  should go. Question 3: A, with the actions just left of Settings, with "This week" moving
  beside the week's arrows so the week keeps the centre (recommended); B, halfway between the
  wordmark and the week; C, as built.
