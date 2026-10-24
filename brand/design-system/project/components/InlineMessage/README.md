A one- or two-line message next to the thing it is about, in one of four tones, always an icon and words together.

## Use

- `caption` text with a 16px Lucide icon, `space-2` apart, no box and no fill. It sits `space-2` below the field, button row or setting it concerns.
- **Error** (`error-ink`, `circle-alert`, `role="alert"`): something failed and needs the person. Say what happened, then what to do: "Can’t reach the server. Check the connection and try again."
- **Caution** (`caution-ink`, `triangle-alert`, `role="status"`): over the daily pick, and nothing else. Always with the words: "Four exercises today, one extra." Never for errors.
- **Success** (`ink`, `check`, `role="status"`): something finished that the person may not see otherwise: "Added to your account…", "Imported." Never `pen`: pen means a done session, not a done task. Never celebrate.
- **Info** (`ink-secondary`, `info`, `role="status"`): a neutral fact: "Nothing new: everything in that file is already here."
- For errors on a single field, TextField's own error line is this component; tie it with `aria-describedby`. For connection and sync state across the app, use a Banner.

## States

- Appears and disappears without motion. Error and caution stay until their cause is gone; success and info may clear on the next action.
- The live role is on the message element, present before the text arrives, so screen readers announce it.

## You provide

- `tone` (`error`, `caution`, `success`, `info`) and the words. No exclamation marks, no blame, small numbers as words.
- The app's "That file isn’t an Fitness Planner export." becomes "That file isn’t a Fitness Planner export. Choose a file made with Export."; "The server refused the import, so nothing changed." gains "Try again, or export a fresh file."
