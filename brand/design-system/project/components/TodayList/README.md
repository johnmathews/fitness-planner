The phone's first view: today's exercises and foods as one list, each with a single DayMark, under the day's heading and a one-line summary.

## Use

- **Below 640px the app opens here** (K5); a Today | Week SegmentedControl at the top right, drawn exactly as its card (44px, `label` type on both segments), switches to the WeekGrid. On wider screens the WeekGrid is the main view and TodayList isn't shown.
- **Day heading** on the `highlight` band, which runs edge to edge: the date in `title-2` ("Thursday 22 October"), then the summary in `body-large`. The band is today's column turned sideways; nothing else in the list is highlighted.
- **Summary**, counting exercises against the daily pick, in words:

  | Done today, pick of three | Summary |
  | --- | --- |
  | 0 | "None yet. Three to go." |
  | 2 | "Two of three. One to go." |
  | 3 | "Three of three." |
  | 4 | "Four today, one extra." |

  No praise, no exclamation marks, no guilt.
- **Groups:** "Exercises" then "Diet", each a `label` heading in `ink-secondary` over a list with `line` hairlines between rows.
- **Rows:** the name in `body` at 600; beneath it the Chip(s) and the week so far in `caption` `ink-secondary` ("3 of 4 this week"); the DayMark on the right. Foods have no chips.
- **DayMark:** the same 24px dot or ring, in a 48 × 48px button for the thumb. The row itself is not a button, so a scroll never marks a day by accident.
- **Notes:** a day's note shows under its row in the `note` style (serif italic, `ink`), the person's words without quotation marks. The list never invites one: no "Add a note" in a row.
- Side gutter `space-4`; rows at least 64px tall.

## States

| Part | State | Look |
| --- | --- | --- |
| Row | not done / done | see DayMark |
| Row | has a note | the note's text beneath the row |
| Summary | under, at or over the pick | see the table above |
| Diet | any | no effect on the summary; foods have no pick |
| Another week | the week has no today | the switch opens the WeekGrid; TodayList always shows today |

## Accessibility

- The heading is the page's `<h1>`, with a visually hidden "Today, " in front of the date.
- Each DayMark is a `<button aria-pressed>` named "Squats, today" (or "Squats, today, has a note"); the note text is linked with `aria-describedby`, so it is read after the name. The row's caption is plain text before the button.
- The rows are an ordinary list: Tab moves from mark to mark, about ten stops for the whole day.
- The view switch is a SegmentedControl: a `role="group"` with `aria-label="View"` and `aria-pressed` on each segment, single choice (pressing the chosen segment keeps it chosen). Its label is visually omitted because the two segment words, Today and Week, name the view themselves; this is the SegmentedControl's one stated exception. Tab enters the group and arrow keys move between the segments (Reka's roving focus).
- `ink` and `ink-secondary` on `highlight` are measured by the gate.

## You provide

Today's full date; the daily pick; for each exercise its name, chips, weekly done count and goal, today's done flag and note; for each food its name, weekly done count and goal and today's flag; the toggle handler; the view switch handler.
