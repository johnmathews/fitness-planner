# Food loses its hint

A comment on the UI review artifact asked to remove "Mark each day you ate it." under the Food
heading. Exercises lost its hint the day before
([261024-ui-review-comments](261024-ui-review-comments.md)), so now neither section has a hint line.

- SectionHeader keeps its optional `hint` prop. It is a small, tested part of the component, and
  the card still documents it, so a section can have a hint again without a new card.
- The SectionHeader card's Food example and the `/styleguide` copy of it drop the hint, so the card
  shows what the app shows.
- The planner test now checks that no section renders a hint line. The SectionHeader unit tests
  still cover the hint itself.
