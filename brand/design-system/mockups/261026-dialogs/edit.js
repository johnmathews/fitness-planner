// The Edit plan page as built (K54), with a dialog open over it, drawn so the dialogs' size can be
// tried in place. Copied from 261026-edit-plan. EP.mount(el, options) draws into el and sizes from
// el's own box (edit.css). Options:
//   dialog  'add' | 'confirm'   Add exercise, or the "Remove Squats?" question
//   look    'now' | 'a' | 'b'   as shipped; centred at the page's size; a sheet from the right
// The plan is the demo account's; the marks are the app's stamped ticks (marks.js).
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
  const FOODS = [{ name: 'Vegetables', marks: [g, _, _, _, _, _, _] }, { name: 'Fruit', marks: [_, _, _, _, _, _, _] }, { name: 'Fish', marks: [_, _, _, _, _, _, _] }]
  const mark = (kind) => `<span class="mark"${kind ? ` data-mark="${kind}"` : ''}><svg viewBox="0 0 36 36" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind ? `<path class="ink" d="${ART.stamp}" fill-rule="evenodd"/><path class="sym" d="${ART.ticks[kind]}" fill="none" stroke-width="3.25"/>` : ''}<path class="bx" d="${ART.box}" stroke-width="1.75"/></svg></span>`
  const field = (label, cls = '', value = '', ph = '') => `<label class="ep-field ${cls}"><span class="ep-label">${label}</span><span class="ep-input">${value || `<span class="ph">${ph}</span>`}</span></label>`
  const seg = (label, a, b) => `<div class="ep-field"><span class="ep-label">${label}</span><span class="seg"><button type="button" aria-pressed="true">${a}</button><button type="button" aria-pressed="false">${b}</button></span></div>`
  function grid(rows, section) {
    let cells = `<div class="hd corner"></div>` + DAYS.map((d) => `<div class="hd">${d}</div>`).join('') + `<div class="hd rmh"><span class="vh">Remove</span></div>`
    for (const r of rows) {
      const chips = (r.chips || []).map((c) => `<span class="chip">${c}</span>`).join('')
      cells += `<div class="nm"><span class="nl"><span class="n">${r.name}</span><button type="button" class="ib edit" aria-label="Edit ${r.name}">${I('pencil')}</button>${chips}</span><button type="button" class="ib rm-in" aria-label="Remove ${r.name}">${I('trash')}</button>${r.note ? `<span class="note">${r.note}</span>` : ''}</div>`
      cells += r.marks.map((k) => `<div class="d">${mark(k)}</div>`).join('')
      cells += `<div class="rm"><button type="button" class="ib" aria-label="Remove ${r.name}">${I('trash')}</button></div>`
    }
    return `<div class="grid" data-section="${section}" style="--rows:${rows.length}">${cells}</div>`
  }
  function addExercise(layout) {
    if (layout === 'b') return `<div class="ep-add"><button type="button" class="btn">${I('plus')}Add exercise</button></div>`
    return `<form class="ep-add ep-form">${field('New exercise', 'wide', '', '')}${field('Sets', 'num')}${seg('Measure', 'Reps', 'Time')}${field('Reps', 'num')}${seg('Reps count', 'Per set', 'Each side')}${field('Weight in kg', 'kg', '', 'Bodyweight')}<button type="submit" class="btn primary">${I('plus')}Add exercise</button></form>`
  }
  function addFood(layout) {
    if (layout === 'b') return `<div class="ep-add"><button type="button" class="btn">${I('plus')}Add food</button></div>`
    return `<form class="ep-add ep-form">${field('New food', 'wide')}<button type="submit" class="btn primary">${I('plus')}Add food</button></form>`
  }
  const area = (label, hint) => `<label class="ep-field"><span class="ep-label">${label}</span><span class="ep-input ep-area"></span><span class="ep-hint"><span>${hint}</span><span>0 of 500 characters</span></span></label>`
  const stepper = (label) => `<div class="ep-field"><span class="ep-label">${label}</span><span class="ep-stepper"><button type="button" aria-label="Fewer times a week">${I('minus')}</button><output>3</output><button type="button" aria-label="More times a week">${I('plus')}</button></span></div>`
  function dialog(kind) {
    if (kind === 'confirm') {
      return `<div class="ep-scrim"><div class="ep-dialog ep-confirm" role="alertdialog" aria-label="Remove Squats?"><div class="ep-dh"><h2>Remove Squats?</h2></div>
      <div class="ep-dbody"><p class="ep-dtext">It comes off this week’s plan. Weeks with their own plan keep it, and its marks stay.</p></div>
      <div class="ep-dfoot"><button type="button" class="btn">Cancel</button><button type="button" class="btn primary">Remove</button></div></div></div>`
    }
    return `<div class="ep-scrim"><div class="ep-dialog" role="dialog" aria-label="Add exercise"><div class="ep-dh"><h2>Add exercise</h2><button type="button" class="ib" aria-label="Close">${I('x')}</button></div>
      <div class="ep-dbody">${field('Name', 'wide', 'Lunges')}<div class="ep-drow">${field('Sets', 'num', '3')}${seg('Measure', 'Reps', 'Time')}${field('Reps', 'num', '10')}</div><div class="ep-drow">${seg('Reps count', 'Per set', 'Each side')}${field('Weight in kg', 'kg', '', 'Bodyweight')}${stepper('Times a week')}</div>${area('Note', 'Markdown works: **bold**, *italic*, links.')}</div>
      <div class="ep-dfoot"><button type="button" class="btn">Cancel</button><button type="button" class="btn primary">Add exercise</button></div></div></div>`
  }
  function page(opts) {
    const L = opts.layout
    const bar = `<header class="ep-bar"><div class="ep-bar-in"><div class="start">${WM()}</div>
      <nav class="week"><button type="button" class="ib arrow" aria-label="Previous week">${I('chevron-left')}</button><span class="wl">26 Oct – 1 Nov</span><button type="button" class="ib arrow" aria-label="Next week">${I('chevron-right')}</button></nav>
      <div class="end"><button type="button" class="ba" aria-pressed="true">${I('pencil')}<span>Edit plan</span></button><button type="button" class="ba">${I('settings')}<span>Settings</span></button><button type="button" class="ba">${I('printer')}<span>Print…</span></button><button type="button" class="ba">${I('maximize')}<span>Full screen</span></button></div></div></header>`
    if (L === 'now') {
      return `${bar}<main class="ep-now"><h1>26 Oct – 1 Nov</h1><button type="button" class="btn sm">Copy plan to next week</button><h2>Exercises</h2>${grid(EXERCISES, 'ex')}${addExercise('a')}<h2>Food</h2>${grid(FOODS, 'food')}${addFood('a')}</main>`
    }
    return `${bar}<main class="ep-page"><h1 class="vh">26 Oct – 1 Nov</h1>
      <section><div class="ep-head"><h2>Exercises<span class="wk">26 Oct – 1 Nov</span></h2><button type="button" class="btn">${I('copy')}Copy plan to next week</button></div>${grid(EXERCISES, 'ex')}${addExercise(L)}</section>
      <section><div class="ep-head"><h2>Food<span class="wk">26 Oct – 1 Nov</span></h2></div>${grid(FOODS, 'food')}${addFood(L)}</section></main>${opts.dialog ? dialog(opts.dialog) : ''}`
  }
  function mount(el, opts = {}) {
    el.classList.add('ep')
    el.dataset.layout = 'b'
    el.dataset.look = opts.look || 'a'
    el.innerHTML = `<div class="ep-scroll">${page({ layout: 'b', dialog: opts.dialog || 'add' })}</div>`
    el.addEventListener('click', (e) => {
      const b = e.target.closest('.seg button')
      if (b) { e.preventDefault(); b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))) }
      if (e.target.closest('form button[type="submit"], a')) e.preventDefault()
    })
  }
  window.EP = { mount }
})()
