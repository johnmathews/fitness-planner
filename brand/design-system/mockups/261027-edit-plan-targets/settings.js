// The Settings page, drawn so its layout can be tried in place. SP.mount(el, options) draws the
// page into el and sizes it from el's own box (settings.css), so one script draws a scaled
// desktop, a phone and the full-size try page. Options:
//   layout  'a'                 rows like the week, as built (K51)
//   moved   true                as asked on 2026-10-27: Theme under Marks, and no Planner section
//                               (its Exercises a day moves to Edit plan)
//   theme   (from the pane)     the page follows the [data-theme] it sits in
// The copy is the app's (SettingsPage.vue); the mark pictures are the card's (set-marks.js).
(() => {
  const I = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.BAR_ART.icons[n]}</svg>`
  let n = 0
  function page(chosen, moved) {
    const id = `sp${++n}`
    const sets = window.SET_ART.sets.map((s, i) =>
      `<button type="button" role="radio" class="choice" aria-checked="${i === chosen}" tabindex="${i === chosen ? 0 : -1}"><span class="dot" aria-hidden="true"></span><span class="name">${s.name}</span><span class="picture" aria-hidden="true">${s.picture}</span></button>`).join('')
    const theme = `    <div class="sp-field"><span class="sp-label" id="${id}-theme">Theme</span>
      <div class="seg" role="group" aria-labelledby="${id}-theme"><button type="button" aria-pressed="true">System</button><button type="button" aria-pressed="false" tabindex="-1">Light</button><button type="button" aria-pressed="false" tabindex="-1">Dark</button></div></div>`
    const marks = `    <div class="sp-field"><span class="sp-label" id="${id}-marks">Marks</span>
      <div class="choices" role="radiogroup" aria-labelledby="${id}-marks">${sets}</div></div>`
    const planner = `<section class="sp-sec" aria-labelledby="${id}-plan"><h2 id="${id}-plan">Planner</h2><div class="sp-body">
    <div class="sp-field sp-inline"><span class="sp-label" id="${id}-pick">Exercises a day</span>
      <div class="stepper" role="group" aria-labelledby="${id}-pick"><button type="button" aria-label="Fewer exercises a day" data-step="-1">${I('minus')}</button><output class="value" aria-live="polite">3</output><button type="button" aria-label="More exercises a day" data-step="1">${I('plus')}</button></div></div>
  </div></section>`
    // Round 2: no bar (K52); the page links back to the week itself.
    return `<main class="sp-page">
  <a class="sp-back" href="#">${I('chevron-left')}<span>Back to the week</span></a>
  <h1 class="sp-title" tabindex="-1">Settings</h1>
  <section class="sp-sec" aria-labelledby="${id}-look"><h2 id="${id}-look">Appearance</h2><div class="sp-body">
${moved ? marks + theme : theme + marks}  </div></section>
  ${moved ? '' : planner}
  <section class="sp-sec" aria-labelledby="${id}-data"><h2 id="${id}-data">Your data</h2><div class="sp-body">
    <div class="sp-row"><p class="sp-lede">Export saves everything to a file. Import adds a file’s plans and marks to yours and never deletes anything.</p>
    <div class="btns" role="group" aria-labelledby="${id}-data"><button type="button" class="btn">${I('download')}Export</button><button type="button" class="btn">${I('upload')}Import…</button></div></div>
  </div></section>
  <section class="sp-sec" aria-labelledby="${id}-acct"><h2 id="${id}-acct">Account</h2><div class="sp-body">
    <div class="sp-row"><p class="sp-lede">Signed in as <span class="who">john</span></p>
    <div class="btns"><button type="button" class="btn">${I('log-out')}Sign out</button></div></div>
  </div></section>
</main>`
  }
  function mount(el, opts = {}) {
    el.classList.add('sp')
    el.dataset.layout = opts.layout || 'a'
    el.innerHTML = `<div class="sp-scroll">${page(opts.chosen ?? 2, !!opts.moved)}</div>`
    el.addEventListener('click', (e) => {
      if (e.target.closest('a')) e.preventDefault()
      const seg = e.target.closest('.seg button')
      if (seg) seg.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === seg)))
      const row = e.target.closest('[role="radio"]')
      if (row) row.parentElement.querySelectorAll('[role="radio"]').forEach((r) => r.setAttribute('aria-checked', String(r === row)))
      const step = e.target.closest('[data-step]')
      if (step) {
        const out = step.parentElement.querySelector('.value')
        out.textContent = Math.min(8, Math.max(1, Number(out.textContent) + Number(step.dataset.step)))
      }
    })
  }
  window.SP = { mount }
})()
