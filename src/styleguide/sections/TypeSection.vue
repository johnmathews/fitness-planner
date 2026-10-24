<script setup lang="ts">
/** The type styles (tokens.css, plus main.css's italic note and smaller phone display). */
const STYLES = [
  { name: 'display', sample: 'This week' },
  { name: 'title-1', sample: 'Exercises' },
  { name: 'title-2', sample: 'Food' },
  { name: 'body-large', sample: 'Three of four sessions done this week.' },
  { name: 'body', sample: 'This invite has already been used. Go to sign in.' },
  { name: 'caption', sample: 'At least 10 characters.' },
  { name: 'label', sample: 'Weight in kg' },
  { name: 'note', sample: 'Left shoulder felt tight on the last set. Dropped to 10 kg.' },
] as const
</script>

<template>
  <dl class="flex flex-col gap-5">
    <div
      v-for="style in STYLES"
      :id="`sg-type-${style.name}`"
      :key="style.name"
      class="flex flex-col gap-1"
    >
      <dt class="caption text-ink-secondary">{{ style.name }}</dt>
      <dd :class="style.name" class="break-words">{{ style.sample }}</dd>
    </div>
  </dl>
</template>
