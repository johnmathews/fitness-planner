// The Edit plan page, drawn so its layout can be tried in place. EP.mount(el, options) draws the
// page into el and sizes it from el's own box (edit.css), like the planner's prototype. Options:
//   layout  'now' | 'a' | 'b' | 'c'   as shipped (K54); the day's target beside the title; at the
//                                     title line's end (K56); under the title (round 2)
//           'm44' | 'm40'             round 3: centred on the title line, at 44px or max(44px, 40u)
//           'st' | 'pd'               round 4, centred at M40: the words stacked over the Stepper;
//                                     no words, the Stepper's value reading "4 per day"
// The plan is the demo account's; the marks are the app's stamped ticks (marks.js). The steppers
// work: a day whose marks reach its target turns green and is underlined, as the week's are (K60).
(() => {
  const ART = window.FP_ART
  const I = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.BAR_ART.icons[n]}</svg>`
  const WM = () => `<svg class="wm" viewBox="${window.BAR_ART.wordmark.viewBox}" role="img" aria-label="Tracker"><path d="${window.BAR_ART.wordmark.path}"/></svg>`
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const g = 'great', x = 'missed', _ = null
  const EXERCISES = [
    { name: 'Push-ups', chips: ['3 × 12'], note: 'Slow on the way down. <a href="#">Form video</a>', marks: [g, _, _, _, _, _, _] },
    { name: 'Squats', chips: ['3 × 15', '16 kg'], marks: [_, _, _, _, _, _, _] },
    { name: 'Plank', chips: ['3 × 45 s'], marks: [g, _, _, _, _, _, _] },
    { name: 'Kettlebell halos', chips: ['8 each side', '12 kg'], marks: [_, _, _, _, _, _, _] },
    { name: 'Pull-ups', chips: ['3 × 5'], marks: [x, _, _, _, _, _, _] },
  ]
  const FOODS = [{ name: 'Vegetables', marks: [g, _, _, _, _, _, _] }, { name: 'Fruit', marks: [g, _, _, _, _, _, _] }, { name: 'Fish', marks: [_, _, _, _, _, _, _] }]
  const mark = (kind) => `<span class="mark"${kind ? ` data-mark="${kind}"` : ''}><svg viewBox="0 0 36 36" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind ? `<path class="ink" d="${ART.stamp}" fill-rule="evenodd"/><path class="sym" d="${ART.ticks[kind]}" fill="none" stroke-width="3.25"/>` : ''}<path class="bx" d="${ART.box}" stroke-width="1.75"/></svg></span>`
  // A day is met when its marks reach the section's target (any mark counts, as in the app).
  const metDays = (rows, pick) => DAYS.map((_, i) => rows.filter((r) => r.marks[i]).length >= pick)
  function grid(rows, section, pick) {
    const met = metDays(rows, pick)
    let cells = `<div class="hd corner"></div>` + DAYS.map((d, i) => `<div class="hd"${met[i] ? ' data-met' : ''}><span class="dn">${d}</span></div>`).join('') + `<div class="hd rmh"><span class="vh">Remove</span></div>`
    for (const r of rows) {
      const chips = (r.chips || []).map((c) => `<span class="chip">${c}</span>`).join('')
      cells += `<div class="nm"><span class="nl"><span class="n">${r.name}</span><button type="button" class="ib edit" aria-label="Edit ${r.name}">${I('pencil')}</button>${chips}</span><button type="button" class="ib rm-in" aria-label="Remove ${r.name}">${I('trash')}</button>${r.note ? `<span class="note">${r.note}</span>` : ''}</div>`
      cells += r.marks.map((k) => `<div class="d">${mark(k)}</div>`).join('')
      cells += `<div class="rm"><button type="button" class="ib" aria-label="Remove ${r.name}">${I('trash')}</button></div>`
    }
    return `<div class="grid" data-section="${section}" data-pick="${pick}" style="--rows:${rows.length}">${cells}</div>`
  }
  const addButton = (what) => `<div class="ep-add"><button type="button" class="btn">${I('plus')}Add ${what}</button></div>`
  // The day's target: a Stepper at the page's control size (K51, K55). Its group is named for
  // what it counts; A writes the words after it, B before it, as Settings did (K53).
  function stepper(id, what, value, layout) {
    const word = what === 'exercises' ? 'Exercises' : 'Foods'
    const words = layout === 'a' ? `<span class="tg-words" id="${id}" aria-label="${word} a day">a day</span>` : `<span class="tg-words" id="${id}">${word} a day</span>`
    // PD: no words on screen; the group keeps the name, and the value carries "per day".
    const suffix = layout === 'pd' ? ' per day' : ''
    const named = layout === 'pd' ? `aria-label="${word} a day"` : `aria-labelledby="${id}"`
    const group = `<div class="stepper" role="group" ${named}><button type="button" aria-label="Fewer ${what} a day" data-step="-1"${value <= 1 ? ' aria-disabled="true"' : ''}>${I('minus')}</button><output class="value" aria-live="polite" data-suffix="${suffix}">${value}${suffix}</output><button type="button" aria-label="More ${what} a day" data-step="1"${value >= 8 ? ' aria-disabled="true"' : ''}>${I('plus')}</button></div>`
    if (layout === 'pd') return `<div class="tg" data-layout="${layout}">${group}</div>`
    return `<div class="tg" data-layout="${layout}">${layout === 'a' ? group + words : words + group}</div>`
  }
  let uid = 0
  function page(opts) {
    const L = opts.layout
    const bar = `<header class="ep-bar"><div class="ep-bar-in"><div class="start">${WM()}</div>
      <nav class="week"><button type="button" class="ib arrow" aria-label="Previous week">${I('chevron-left')}</button><span class="wl">26 Oct – 1 Nov</span><button type="button" class="ib arrow" aria-label="Next week">${I('chevron-right')}</button></nav>
      <div class="end"><button type="button" class="ba" aria-pressed="true">${I('pencil')}<span>Edit plan</span></button><button type="button" class="ba">${I('settings')}<span>Settings</span></button><button type="button" class="ba">${I('printer')}<span>Print…</span></button><button type="button" class="ba">${I('maximize')}<span>Full screen</span></button></div></div></header>`
    const id = `ep${++uid}`
    if (L === 'now') {
      return `${bar}<main class="ep-page"><h1 class="vh">26 Oct – 1 Nov</h1>
      <section><div class="ep-head"><h2>Exercises<span class="wk">26 Oct – 1 Nov</span></h2><button type="button" class="btn">${I('copy')}Copy plan to next week</button></div>${grid(EXERCISES, 'ex', 3)}${addButton('exercise')}</section>
      <section><div class="ep-head"><h2>Food<span class="wk">26 Oct – 1 Nov</span></h2></div>${grid(FOODS, 'food', 99)}${addButton('food')}</section></main>`
    }
    return `${bar}<main class="ep-page"><h1 class="vh">Edit plan, 26 Oct – 1 Nov</h1>
      <section><div class="ep-head" data-layout="${L}"><h2>Exercises</h2>${stepper(id + 'x', 'exercises', 3, L)}</div>${grid(EXERCISES, 'ex', 3)}${addButton('exercise')}</section>
      <section><div class="ep-head" data-layout="${L}"><h2>Food</h2>${stepper(id + 'f', 'foods', 2, L)}</div>${grid(FOODS, 'food', 2)}${addButton('food')}</section></main>`
  }
  function mount(el, opts = {}) {
    el.classList.add('ep')
    el.dataset.layout = opts.layout || 'a'
    el.innerHTML = `<div class="ep-scroll">${page({ layout: el.dataset.layout })}</div>`
    el.addEventListener('click', (e) => {
      if (e.target.closest('a')) e.preventDefault()
      // A step redraws the section's grid, so the days it now meets turn green.
      const step = e.target.closest('[data-step]')
      if (step && step.getAttribute('aria-disabled') !== 'true') {
        const out = step.parentElement.querySelector('.value')
        const v = Math.min(8, Math.max(1, parseInt(out.textContent, 10) + Number(step.dataset.step)))
        out.textContent = v + (out.dataset.suffix || '')
        step.parentElement.querySelectorAll('[data-step]').forEach((b) => {
          const at = b.dataset.step === '-1' ? v <= 1 : v >= 8
          if (at) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled')
        })
        const section = step.closest('section')
        const g = section.querySelector('.grid')
        const rows = g.dataset.section === 'ex' ? EXERCISES : FOODS
        g.outerHTML = grid(rows, g.dataset.section, v)
      }
    })
  }
  window.EP = { mount }
})()
