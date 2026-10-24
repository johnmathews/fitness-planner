<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { INKS } from '@/lib/inks'
import { APP_NAME } from '@/lib/app'
import { TextLink } from '@/components/ui/text-link'
import { ConfirmHost } from '@/components/ui/confirm-dialog'
import { SECTIONS } from './sections'
import { applyLook, lookSearch, readLook, type Look } from './look'

/**
 * The living style guide (brand spec K2): every component rendered by its real source, in either
 * theme and any ink. Development builds only: src/main.ts mounts it at /styleguide instead of
 * the app. W13's browser checks (axe, 375px, the focus ring) run against it. Components are added
 * in sections.ts.
 */
const root = document.documentElement
const look = ref<Look>(readLook(location.search, root.classList.contains('dark')))

// Draw the look and keep it in the address bar, so a reload or a shared link opens the same view.
watchEffect(() => {
  applyLook(root, look.value)
  history.replaceState(
    history.state,
    '',
    location.pathname + lookSearch(look.value) + location.hash,
  )
})

document.title = `Style guide · ${APP_NAME}`

// The page mounts after the browser has looked for the address's #section, so go to it now.
onMounted(() => {
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
})

const SELECT =
  'h-11 rounded-sm border border-control-border bg-panel px-2 text-base text-ink hover:border-ink'
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-line bg-canvas">
    <div
      class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6 lg:px-8"
    >
      <p class="label mr-auto hidden text-ink-secondary sm:block">{{ APP_NAME }} · Style guide</p>
      <div class="flex items-center gap-2">
        <label for="sg-theme" class="label">Theme</label>
        <select id="sg-theme" v-model="look.theme" :class="SELECT">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label for="sg-ink" class="label">Ink</label>
        <select id="sg-ink" v-model="look.ink" :class="SELECT">
          <option v-for="ink in INKS" :key="ink.id" :value="ink.id">{{ ink.name }}</option>
        </select>
      </div>
    </div>
  </header>

  <main id="sg-main" class="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
    <div class="py-10">
      <h1 class="display">Style guide</h1>
      <p class="body-large mt-3 max-w-prose text-ink-secondary">
        Every component the app is built from, drawn by its real source in each state its card
        shows. Switch the theme and the ink above; the address keeps your choice, so a link opens
        the same view. Hover follows the pointer, and focus follows the Tab key.
      </p>
      <nav aria-label="Contents" class="mt-6">
        <ul class="flex flex-wrap gap-x-5 gap-y-2">
          <li v-for="section in SECTIONS" :key="section.id">
            <TextLink :href="`#${section.id}`" class="body">{{ section.title }}</TextLink>
          </li>
        </ul>
      </nav>
    </div>

    <section
      v-for="section in SECTIONS"
      :id="section.id"
      :key="section.id"
      :aria-labelledby="`${section.id}-title`"
      class="border-t border-line py-10"
    >
      <h2 :id="`${section.id}-title`" class="title-1">{{ section.title }}</h2>
      <p class="body mt-2 max-w-prose text-ink-secondary">{{ section.summary }}</p>
      <div class="mt-6">
        <component :is="section.component" />
      </div>
    </section>
  </main>

  <!-- The one host useConfirm() needs, as the app mounts it. -->
  <ConfirmHost />
</template>
