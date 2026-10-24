import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Self-hosted fonts (the CSP allows only 'self'): Vite bundles the files under /assets/. Each
// stylesheet declares every subset with a unicode-range, so a browser downloads only what a page
// uses: in practice the latin files, which index.html preloads. The serif italic is for notes.
import '@fontsource-variable/source-sans-3/wght.css'
import '@fontsource-variable/source-serif-4/wght.css'
import '@fontsource-variable/source-serif-4/wght-italic.css'
import './styles/main.css'
import App from './App.vue'
import { migrateKeyPrefix } from './lib/storage'

// The living style guide (src/styleguide) replaces the app at /styleguide, in development only.
// `import.meta.env.DEV` is the constant `false` in a production build, so the bundler drops this
// branch and the dynamic import with it: the style guide never ships.
if (import.meta.env.DEV && location.pathname.replace(/\/$/, '') === '/styleguide') {
  void import('./styleguide/StyleGuide.vue').then(({ default: StyleGuide }) =>
    createApp(StyleGuide).mount('#app'),
  )
} else {
  // Before the stores are created, since they read storage as they start.
  migrateKeyPrefix()
  createApp(App).use(createPinia()).mount('#app')
}
