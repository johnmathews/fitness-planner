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

// Before the stores are created, since they read storage as they start.
migrateKeyPrefix()
createApp(App).use(createPinia()).mount('#app')
