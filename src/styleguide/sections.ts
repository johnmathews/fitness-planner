import type { Component } from 'vue'
import ColourSection from './sections/ColourSection.vue'
import TypeSection from './sections/TypeSection.vue'
import ButtonSection from './sections/ButtonSection.vue'
import IconButtonSection from './sections/IconButtonSection.vue'
import BrandMarkSection from './sections/BrandMarkSection.vue'
import TextLinkSection from './sections/TextLinkSection.vue'
import TextFieldSection from './sections/TextFieldSection.vue'
import TextAreaSection from './sections/TextAreaSection.vue'
import SegmentedControlSection from './sections/SegmentedControlSection.vue'
import SwitchSection from './sections/SwitchSection.vue'
import StepperSection from './sections/StepperSection.vue'
import InkPickerSection from './sections/InkPickerSection.vue'
import PopoverSection from './sections/PopoverSection.vue'
import DialogSection from './sections/DialogSection.vue'
import ConfirmDialogSection from './sections/ConfirmDialogSection.vue'
import InlineMessageSection from './sections/InlineMessageSection.vue'
import BannerSection from './sections/BannerSection.vue'

/**
 * One section of the style guide. StyleGuide.vue renders each as
 * `<section id="{id}"><h2 id="{id}-title">{title}</h2><p>{summary}</p><component /></section>`
 * and lists it in the contents, so adding a component is one entry in SECTIONS below.
 */
export interface StyleGuideSection {
  /** The section's anchor, `sg-` and the component's name in kebab case (`sg-text-field`). */
  id: `sg-${string}`
  /** The component's name, shown as the section's heading. */
  title: string
  /** One sentence: what it is for (the first sentence of its card's README). */
  summary: string
  /**
   * Renders the real component in every state its card shows (brand/design-system/project/
   * components/<Name>/preview.html), in the card's copy, each state captioned. One canonical
   * instance per state carries an id `{section id}-{variant}-{state}` (`sg-button-primary-busy`)
   * for the browser checks; every interactive example has an accessible name; nothing in it may
   * be wider than a 375px viewport. Hover cannot be forced, so it is left to the pointer.
   */
  component: Component
}

/** The sections in page order: foundations, then the components as the system groups them. */
export const SECTIONS: readonly StyleGuideSection[] = [
  {
    id: 'sg-colour',
    title: 'Colour',
    summary:
      'The roles every component draws with, in the current theme. The pen follows the ink switch.',
    component: ColourSection,
  },
  {
    id: 'sg-type',
    title: 'Type',
    summary: 'Source Serif 4 for headings and notes, Source Sans 3 for everything else.',
    component: TypeSection,
  },
  {
    id: 'sg-button',
    title: 'Button',
    summary:
      'The text button in three weights: primary for the one action a step exists for, secondary for the other choices beside it, and quiet for the least of them.',
    component: ButtonSection,
  },
  {
    id: 'sg-icon-button',
    title: 'IconButton',
    summary:
      'A 44px square button that shows one Lucide icon and carries its meaning in an accessible label.',
    component: IconButtonSection,
  },
  {
    id: 'sg-brand-mark',
    title: 'BrandMark',
    summary:
      'The product’s name as a mark: the “Fitness Planner” wordmark in Source Serif 4 600, and an “FP” monogram for small spaces.',
    component: BrandMarkSection,
  },
  {
    id: 'sg-text-link',
    title: 'TextLink',
    summary:
      'A link in ink with a visible underline, for going somewhere rather than doing something.',
    component: TextLinkSection,
  },
  {
    id: 'sg-text-field',
    title: 'TextField',
    summary:
      'A single-line input with its label always visible above it, an optional hint below, and an error that says what happened and what to do.',
    component: TextFieldSection,
  },
  {
    id: 'sg-text-area',
    title: 'TextArea',
    summary:
      "A multi-line input that follows TextField's label, hint and error rules, for text longer than a line.",
    component: TextAreaSection,
  },
  {
    id: 'sg-segmented-control',
    title: 'SegmentedControl',
    summary:
      'A row of two or three toggle buttons, exactly one chosen, for a setting whose options all fit on screen at once.',
    component: SegmentedControlSection,
  },
  {
    id: 'sg-switch',
    title: 'Switch',
    summary:
      'An on/off control that takes effect at once, with its label inside the same 44px button.',
    component: SwitchSection,
  },
  {
    id: 'sg-stepper',
    title: 'Stepper',
    summary:
      'A small whole number changed one step at a time: a minus button, the value, and a plus button.',
    component: StepperSection,
  },
  {
    id: 'sg-ink-picker',
    title: 'InkPicker',
    summary:
      'The setting that chooses the pen: four inks as named dots in a radio group, the chosen one marked by a ring, a check and its name, never by colour alone.',
    component: InkPickerSection,
  },
  {
    id: 'sg-popover',
    title: 'Popover',
    summary:
      'A small panel attached to the control that opened it; the app has one, Settings, under the settings IconButton in the Header.',
    component: PopoverSection,
  },
  {
    id: 'sg-dialog',
    title: 'Dialog',
    summary: 'A modal panel for one focused task, such as editing an exercise, over a dimmed page.',
    component: DialogSection,
  },
  {
    id: 'sg-confirm-dialog',
    title: 'ConfirmDialog',
    summary:
      "A small modal question before something that can't be undone: what will happen, then two buttons.",
    component: ConfirmDialogSection,
  },
  {
    id: 'sg-inline-message',
    title: 'InlineMessage',
    summary:
      'A one- or two-line message next to the thing it is about, in one of four tones, always an icon and words together.',
    component: InlineMessageSection,
  },
  {
    id: 'sg-banner',
    title: 'Banner',
    summary:
      'A full-width bar above the week that says how the data stands with the server, in words, with the one action that helps.',
    component: BannerSection,
  },
]
