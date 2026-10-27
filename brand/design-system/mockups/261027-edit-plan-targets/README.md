# Daily targets in Edit plan

**Question:** Edit plan takes over the daily targets from Settings: "Exercises a day" beside
"Exercises" and a new "Foods a day" beside "Food". Where on the title line does the Stepper sit?
The week beside the titles and "Copy plan to next week" are gone in both options. The grids, the
bar and the Add buttons stay as they are.

**Status:** decided (2026-10-27, round 4)

**Link:** https://claude.ai/artifact/KPbc4FQ14FWrFcVBL3kF4i (private)

The page is live. `edit.js` and `edit.css` draw Edit plan, and `settings.js` and `settings.css`
draw the Settings page. Both started from the 261026 `edit-plan` and `settings-page` mockups.
`marks.js`, `set-marks.js` and `icons.js` hold the app's drawings and the Lucide icons. `try.html`
shows Edit plan full size, with a switch for the option and the theme.

## Options

Both options:

- An **Exercises a day** Stepper on the Exercises title line, 1 to 8, one setting for every week.
- A new **Foods a day** Stepper on the Food title line, 1 to 8. A day whose food marks reach it
  turns green, as exercise days do (K30).
- Each Stepper is at the page's control size: 60u tall, with its value at 19u (K51, K55).
- No week beside the titles in Edit plan, and no "Copy plan to next week".
- On a phone the Stepper wraps under the title.

The options:

- **A. Beside the title, as one phrase.** The title, the Stepper, then "a day": "Exercises − 3 +
  a day". Recommended: the number sits beside what it counts, and the line stays short.
- **B. At the end of the title line.** "Exercises a day", then the Stepper, at the right where Copy
  plan was. It reads like a Settings row (K53).

On the Settings page, which has no options, Theme moves under Marks in Appearance, and the Planner
section goes.

## Decision

Final, after four rounds on 2026-10-27: **PD**. The Stepper sits alone, centred on the title line
under the bar's week at max(44px, 40u), and reads "4 per day" (K62, K63 in
[decisions.md](../../../../docs/decisions.md)). On the way, round 1 picked B, the words and the
Stepper at the end of the line (K56); round 2 picked A, right after the title (K61); round 3
centred it at M40 (K62); round 4 dropped the words (K63). The first ask was "lets move the
"planner" section out of the settings page entirely and put it in the "edit plan" view", with a
counter beside "Food" too (K57). The Copy plan button goes (K58), and the Settings order is K59.

## Rounds

- **1, 2026-10-27:** A and B, beside the shipped page, and the Settings page as asked.
- **2, 2026-10-27:** after seeing B built, John asked for the target "back on the left, either
  underneath "Exercises" or to the right of it". A (beside the title, as one phrase) again, and C
  (under the title, its words then the Stepper), beside B as built. The prototype now draws met
  days as built (K60).
- **Decision, round 2, 2026-10-27:** John picked **A**, the Stepper right after the title as one
  phrase (K61), over C under the title.
- **3, 2026-10-27:** built, A looked "too big and chunky"; John asked for it "in the center of
  the screen, horizontally centered". Both options centre it on the title line, under the bar's
  week, its words then the Stepper: M44 at the Stepper card's 44px, and M40 at max(44px, 40u).
  On a phone it follows the title.
- **Decision, round 3, 2026-10-27:** John picked **M40**, centred at max(44px, 40u) (K62).
- **4, 2026-10-27:** with M40 built, John asked to see the Stepper "underneath the "exercises
  each day" text", and a version with no words where the Stepper reads "N per day". ST stacks
  the words over the Stepper; PD drops them, its value reading "4 per day". Both centred at M40.
- **Decision, round 4, 2026-10-27:** John picked **PD**, the Stepper alone reading "4 per day" (K63).
