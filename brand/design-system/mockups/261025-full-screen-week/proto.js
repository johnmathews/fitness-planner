// The full-screen planner, as a prototype (proto.css). FP.mount(el, options) draws one screen
// into el: the bar, then Exercises and Food, a screen each. Options:
//   option  'a' | 'b' | 'c'   how the bar and the titles behave (the mockup's question 1)
//   phone   'p1' | 'p2'       a phone held upright: today, or the week narrow (question 2)
//   input   'mouse' | 'touch' how the bar is reached: the top edge, or the handle
//   start   'exercises' | 'food'   bar  'shown'   for the stills on the mockup page
// The week is John's own from his screenshots: 19–25 October, today Sunday, three a day.
(() => {
  const ART = window.FP_ART
  const DAYS = [['Mon', 'Monday', 19], ['Tue', 'Tuesday', 20], ['Wed', 'Wednesday', 21], ['Thu', 'Thursday', 22],
    ['Fri', 'Friday', 23], ['Sat', 'Saturday', 24], ['Sun', 'Sunday', 25]]
  const TODAY = 6
  const PICK = 3
  const WEEK = '19–25 October'
  const g = 'great', p = 'partial', x = 'missed', _ = null
  const EXERCISES = [
    { name: 'Push-ups', chips: ['3 × 12'], goal: 4, marks: [g, _, g, p, g, _, _] },
    { name: 'Squats', chips: ['3 × 15', '16 kg'], goal: 3, marks: [_, g, x, _, g, _, _] },
    { name: 'Plank', chips: ['3 × 45 s'], goal: 3, marks: [g, p, _, g, _, g, _] },
    { name: 'Kettlebell halos', chips: ['8 each side', '12 kg'], goal: 2, marks: [_, _, g, _, _, _, _] },
    { name: 'Pull-ups', chips: ['3 × 5'], goal: 3, marks: [x, g, _, _, p, _, _] },
  ]
  const FOODS = [
    { name: 'Vegetables', goal: 7, marks: [g, g, g, _, g, g, _] },
    { name: 'Fruit', goal: 5, marks: [_, g, _, g, _, _, _] },
    { name: 'Fish', goal: 2, marks: [_, _, _, g, _, _, _] },
    { name: 'Nuts', goal: 3, marks: [g, _, _, _, _, _, _] },
  ]
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
  const KIND_WORDS = { great: '', partial: ', partly done', missed: ", couldn't do it" }
  const CHECK = '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
  const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

  // The Stamped ticks set, as John's screenshots draw it: the box filled solid in the pen, the
  // symbol in paper, the hand-drawn box over both.
  function markSvg(kind) {
    const ink = kind
      ? `<path class="ink" d="${ART.stamp}" fill-rule="evenodd"/><path class="sym" d="${ART.ticks[kind]}" fill="none" stroke-width="3.25"/>`
      : ''
    return `<svg viewBox="0 0 36 36" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ink}<path class="bx" d="${ART.box}" stroke-width="1.75"/></svg>`
  }
  function markButton(row, i, section) {
    const kind = row.marks[i]
    const [, full, date] = DAYS[i]
    const label = `${row.name}, ${full} ${date} October${i === TODAY ? ', today' : ''}${kind ? KIND_WORDS[kind] : ''}`
    return `<button type="button" class="mark" data-s="${section}" data-r="${row.i}" data-c="${i}"${kind ? ` data-mark="${kind}"` : ''} aria-pressed="${Boolean(kind)}" aria-label="${esc(label)}">${markSvg(kind)}</button>`
  }

  const count = (row) => row.marks.filter(Boolean).length
  const TITLES = { exercises: 'Exercises', food: 'Food' }
  /** Round 3: a day whose marked exercises reach the daily pick. Only the Exercises screen shows it. */
  const dayMet = (rows, i, section) => section === 'exercises' && rows.filter((r) => r.marks[i]).length >= PICK
  const metHead = (met) => (met ? ' met' : '')
  const METWORDS = '<span class="vh">, three picked</span>'
  /** Round 7: a met day's underline, drawn by hand like a green whiteboard marker; one of three by day. */
  const ULINES = ["M2 4.5C3.1 3.7 6.5 3.3 8.8 2.9C11 2.4 13.3 1.8 15.6 1.6C17.8 1.5 20.1 1.9 22.4 2.1C24.6 2.3 26.9 2.5 29.1 2.9C31.4 3.3 33.7 4.5 35.9 4.7C38.2 4.9 40.5 4.1 42.7 4C45 3.8 47.2 3.7 49.5 3.7C51.8 3.8 54 4.2 56.3 4.2C58.5 4.2 60.8 3.8 63.1 3.7C65.3 3.7 67.6 3.8 69.9 3.6C72.1 3.4 74.4 2.6 76.6 2.5C78.9 2.4 81.2 2.9 83.4 2.8C85.7 2.8 88 1.8 90.2 2C92.5 2.2 95.9 3.2 97 4.2C98.1 5.2 98.1 6.9 97 8.2C95.9 9.4 92.5 11.1 90.2 11.9C88 12.7 85.7 12.7 83.4 13.1C81.2 13.5 78.9 13.9 76.6 14.2C74.4 14.4 72.1 14.3 69.9 14.4C67.6 14.5 65.3 15 63.1 15C60.8 15 58.5 14.5 56.3 14.5C54 14.5 51.8 15 49.5 15C47.2 15.1 45 14.7 42.7 14.7C40.5 14.6 38.2 14.5 35.9 14.6C33.7 14.7 31.4 15.1 29.1 15.1C26.9 15 24.6 14.6 22.4 14.2C20.1 13.8 17.8 13.3 15.6 12.8C13.3 12.3 11 12 8.8 11.2C6.5 10.3 3.1 9 2 7.9C0.9 6.7 0.9 5.4 2 4.5Z", "M5 7.2C6.1 5.8 9.5 4.4 11.7 3.6C14 2.7 16.2 2.4 18.4 2.1C20.7 1.7 22.9 1.5 25.1 1.4C27.4 1.3 29.6 1.4 31.9 1.3C34.1 1.2 36.3 0.8 38.6 0.6C40.8 0.5 43 0.1 45.3 0.2C47.5 0.3 49.8 1.2 52 1.2C54.2 1.2 56.5 0.2 58.7 0.1C61 0 63.2 0.3 65.4 0.6C67.7 0.8 69.9 1.7 72.1 1.8C74.4 2 76.6 1.2 78.9 1.3C81.1 1.4 83.3 2 85.6 2.4C87.8 2.9 90 3.3 92.3 4C94.5 4.7 97.9 5.5 99 6.7C100.1 7.8 100.1 9.9 99 11C97.9 12.2 94.5 13.1 92.3 13.7C90 14.2 87.8 14.3 85.6 14.4C83.3 14.4 81.1 14 78.9 13.7C76.6 13.5 74.4 12.7 72.1 12.7C69.9 12.6 67.7 13.2 65.4 13.4C63.2 13.6 61 13.8 58.7 13.7C56.5 13.6 54.2 13 52 12.9C49.8 12.7 47.5 12.8 45.3 12.8C43 12.9 40.8 13.3 38.6 13.2C36.3 13.2 34.1 12.7 31.9 12.7C29.6 12.7 27.4 13.2 25.1 13.4C22.9 13.5 20.7 13.7 18.4 13.7C16.2 13.7 14 13.7 11.7 13.4C9.5 13 6.1 12.7 5 11.7C3.9 10.7 3.9 8.5 5 7.2Z", "M0 4C1.1 3.2 4.4 3.2 6.6 2.9C8.9 2.6 11.1 1.9 13.3 1.9C15.5 2 17.7 2.7 19.9 3.1C22.1 3.5 24.4 4 26.6 4.2C28.8 4.3 31 4 33.2 4C35.4 4.1 37.6 4.5 39.9 4.6C42.1 4.6 44.3 4.5 46.5 4.4C48.7 4.2 50.9 3.9 53.1 3.8C55.4 3.8 57.6 4 59.8 4.1C62 4.1 64.2 4.5 66.4 4.3C68.6 4.1 70.9 3.2 73.1 2.8C75.3 2.5 77.5 2.4 79.7 2.4C81.9 2.3 84.1 2.2 86.4 2.5C88.6 2.8 91.9 3.5 93 4.4C94.1 5.3 94.1 6.6 93 7.8C91.9 9.1 88.6 10.8 86.4 11.8C84.1 12.8 81.9 13.6 79.7 13.9C77.5 14.2 75.3 13.3 73.1 13.3C70.9 13.3 68.6 13.7 66.4 14.1C64.2 14.5 62 15.2 59.8 15.5C57.6 15.8 55.4 16.1 53.1 16.1C50.9 16.2 48.7 16 46.5 15.8C44.3 15.6 42.1 14.9 39.9 14.7C37.6 14.5 35.4 15 33.2 14.8C31 14.6 28.8 13.7 26.6 13.6C24.4 13.5 22.1 14.2 19.9 14.1C17.7 14 15.5 13.5 13.3 12.9C11.1 12.3 8.9 11.4 6.6 10.5C4.4 9.6 1.1 8.7 0 7.6C-1.1 6.5 -1.1 4.7 0 4Z"]
  const underline = (i) => `<svg class="uline" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="${ULINES[i % 3]}"/></svg>`

  // ---- The week grid, wide: a desktop, an iPad, a phone on its side. ----
  function wideScreen(state, section, rows) {
    const corner = state.option === 'b' || state.short
    const head = corner ? '' : `<header class="head"><h2>${TITLES[section]}<span class="wk">${WEEK}</span></h2></header>`
    const cornerCell = corner
      ? `<div class="hd corner"><h2>${TITLES[section]}</h2><span class="wk">${WEEK}</span></div>`
      : `<div class="hd corner"><span class="vh">${section === 'food' ? 'Food' : 'Exercise'}</span></div>`
    let cells = cornerCell
    DAYS.forEach(([short, , date], i) => {
      const met = dayMet(rows, i, section)
      cells += `<div class="hd${i === TODAY ? ' today' : ''}${metHead(met)}"><span class="dn">${short}${met ? CHECK : ''}</span><span class="vh"> ${date}</span>${met ? METWORDS : ''}</div>`
    })
    for (const row of rows) {
      const chips = row.chips?.length ? `<span class="chips">${row.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</span>` : ''
      cells += `<div class="nm"><span class="n">${esc(row.name)}</span>${chips}</div>`
      const last = row.i === rows.length - 1 ? ' last' : ''
      row.marks.forEach((_, i) => {
        const met = dayMet(rows, i, section)
        cells += `<div class="d${i === TODAY ? ' today' : ''}${metHead(met)}${last}">${markButton(row, i, section)}${met && last ? underline(i) : ''}</div>`
      })
    }
    const cue = section === 'exercises' && state.option !== 'b' && !state.short
      ? `<button type="button" class="cue" data-go="food">Food${icon('m6 9 6 6 6-6')}</button>` : ''
    return `<section class="screen" data-section="${section}" aria-label="${TITLES[section]}">${head}<div class="grid" style="--rows:${rows.length}">${cells}</div>${cue}</section>`
  }

  // ---- P2: the week, narrow. ----
  function narrowWeek(state, section, rows) {
    let cells = ''
    DAYS.forEach(([short, , date], i) => {
      const met = dayMet(rows, i, section)
      cells += `<div class="hd${i === TODAY ? ' today' : ''}${metHead(met)}"><span class="dn">${short}${met ? CHECK : ''}</span><span class="vh"> ${date}</span>${met ? METWORDS : ''}</div>`
    })
    for (const row of rows) {
      const chips = (row.chips || []).slice(0, 1).map((c) => `<span class="chip">${esc(c)}</span>`).join('')
      cells += `<div class="line"><span class="n">${esc(row.name)}</span>${chips}</div>`
      const last = row.i === rows.length - 1 ? ' last' : ''
      row.marks.forEach((_, i) => {
        const met = dayMet(rows, i, section)
        cells += `<div class="d${i === TODAY ? ' today' : ''}${metHead(met)}${last}">${markButton(row, i, section)}${met && last ? underline(i) : ''}</div>`
      })
    }
    return `<section class="screen" data-section="${section}" aria-label="${TITLES[section]}"><header class="head"><h2>${TITLES[section]}</h2></header><div class="ngrid" style="--t:${TODAY}">${cells}</div></section>`
  }

  // ---- P1: today, full screen. ----
  function todayScreen(state, section, rows) {
    const done = rows.filter((r) => r.marks[TODAY]).length
    const band = section === 'exercises'
      ? `<div class="band"><h2>Today, Sunday 25 October</h2><p>${done === 0 ? 'None' : WORDS[done][0].toUpperCase() + WORDS[done].slice(1)} of ${WORDS[PICK]} picked.</p></div>`
      : ''
    const list = rows.map((r) => {
      const chips = (r.chips || []).map((c) => `<span class="chip">${esc(c)}</span>`).join('')
      const n = count(r)
      return `<div class="row"><div class="text"><span class="n">${esc(r.name)}</span><span class="sub">${chips}<span class="${n >= r.goal ? 'met' : ''}" data-tot="${section}-${r.i}">${n} of ${r.goal} this week</span></span></div><div class="d">${markButton(r, TODAY, section)}</div></div>`
    }).join('')
    return `<section class="screen" data-section="${section}" aria-label="${TITLES[section]}">${band}<h3>${TITLES[section]}</h3><div class="tl" style="--rows:${rows.length}">${list}</div></section>`
  }

  // ---- The bar (the Header card). ----
  const ICONS = {
    fullscreen: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
    print: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  }
  /** The browser's full screen, where it exists (not on an iPhone). */
  const canFullscreen = () => document.fullscreenEnabled !== false
  const fsButton = () => canFullscreen()
    ? `<button class="icon-btn" type="button" data-action="fullscreen" aria-label="Full screen">${icon(ICONS.fullscreen)}</button>` : ''

  // ---- The sidebar (round 4, N2): hidden, or expanded with an icon and a name per item. ----
  function sidebar() {
    const item = (label, d, action) => `<button class="item" type="button"${action ? ` data-action="${action}"` : ''}>${d.startsWith('<svg') ? d : icon(d)}<span>${label}</span></button>`
    const week = `<nav class="week" aria-label="Week"><button class="icon-btn" type="button" aria-label="Previous week">${icon('m15 18-6-6 6-6')}</button><span class="week-label">${WEEK}</span><button class="icon-btn" type="button" aria-label="Next week">${icon('m9 18 6-6-6-6')}</button></nav>`
    const sw = `<button class="switch" type="button" role="switch" aria-checked="false"><span>Edit plan</span><span class="track" aria-hidden="true"><span class="thumb"></span></span></button>`
    return `<aside class="side" aria-label="Menu"><span class="brand">${ART.wordmark}</span>${week}${sw}<div class="items">${item('Settings', ART.gear)}${item('Print…', ICONS.print)}${canFullscreen() ? item('Full screen', ICONS.fullscreen, 'fullscreen') : ''}</div><div class="room" aria-hidden="true"></div><div class="items foot">${item('Log out', ICONS.logout)}</div></aside><div class="scrim" aria-hidden="true"></div>`
  }

  function bar(state) {
    if (state.nav === 'side') return sidebar()
    const week = `<nav class="week" aria-label="Week"><button class="icon-btn" type="button" aria-label="Previous week">${icon('m15 18-6-6 6-6')}</button><span class="week-label">${WEEK}</span><button class="icon-btn" type="button" aria-label="Next week">${icon('m9 18 6-6-6-6')}</button></nav>`
    const sw = (long) => `<button class="switch" type="button" role="switch" aria-checked="false" aria-label="Edit plan"><span aria-hidden="true">${long ? 'Edit plan' : 'Edit'}</span><span class="track" aria-hidden="true"><span class="thumb"></span></span></button>`
    const gear = `<button class="icon-btn" type="button" aria-label="Settings">${ART.gear}</button>`
    if (state.layout === 'narrow') {
      const seg = state.phone === 'p1' && state.device === 'phone'
        ? '<span class="seg" role="group" aria-label="View"><button type="button" aria-pressed="true">Today</button><button type="button" aria-pressed="false">Week</button></span>' : ''
      return `<header class="bar"><span class="start"></span>${week}<span class="end">${fsButton()}${gear}</span><span class="row-2">${seg}${sw(false)}</span></header>`
    }
    return `<header class="bar"><span class="start">${ART.wordmark}</span>${week}<span class="end">${sw(true)}${fsButton()}${gear}<button class="btn" type="button">Print…</button></span></header>`
  }

  function render(state) {
    const ex = state.ex, food = state.food
    const screen = state.layout === 'narrow' ? (state.phone === 'p1' && state.device === 'phone' ? todayScreen : narrowWeek) : wideScreen
    const dots = `<nav class="dots" aria-label="Screens"><button type="button" data-go="exercises" aria-label="Exercises"><span></span></button><button type="button" data-go="food" aria-label="Food"><span></span></button></nav>`
    state.el.innerHTML = `<div class="hot" aria-hidden="true"></div><button type="button" class="grab" aria-label="Show the menu"><span></span></button>${bar(state)}<div class="scroller">${screen(state, 'exercises', ex)}${screen(state, 'food', food)}</div>${dots}`
    syncDots(state)
  }

  function syncDots(state) {
    const sc = state.el.querySelector('.scroller')
    if (!sc) return
    const at = sc.scrollTop > sc.clientHeight / 2 ? 'food' : 'exercises'
    state.el.querySelectorAll('.dots button').forEach((b) => b.setAttribute('aria-current', String(b.dataset.go === at)))
  }

  function mount(el, opts = {}) {
    const clone = (rows) => rows.map((r, i) => ({ ...r, i, marks: [...r.marks] }))
    const state = { el, option: opts.option || 'a', phone: opts.phone || 'p2', affirm: opts.affirm || 'g2', nav: opts.nav || 'bar', ex: clone(EXERCISES), food: clone(FOODS), layout: '', short: false }
    el.classList.add('fs')
    el.dataset.option = state.option
    el.dataset.affirm = state.affirm
    el.dataset.nav = state.nav
    el.dataset.input = opts.input || (matchMedia('(hover: none)').matches ? 'touch' : 'mouse')
    let pinned = opts.bar === 'shown'
    if (pinned) el.dataset.bar = 'shown'

    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight
      // Held upright, a phone or an iPad folds the week; a phone may show today instead (P1).
      const layout = h > w && w < 1000 ? 'narrow' : 'wide'
      el.dataset.device = w < 640 || h < 640 ? 'phone' : 'tablet'
      state.device = el.dataset.device
      const short = layout === 'wide' && h <= 540
      if (layout === state.layout && short === state.short) return
      const sc = el.querySelector('.scroller')
      const onFood = sc && sc.scrollTop > sc.clientHeight / 2
      state.layout = layout; state.short = short
      el.dataset.layout = layout
      render(state)
      if (onFood) go('food', false)
    }
    const go = (section, smooth = true) => {
      const target = el.querySelector(`.screen[data-section="${section}"]`)
      el.querySelector('.scroller').scrollTo({ top: target.offsetTop, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' })
    }

    // The bar: shown while the pointer is at the top edge or on the bar, or while focus is in it;
    // on touch, by the handle, and hidden again by a press anywhere else.
    let hideTimer
    const show = () => { clearTimeout(hideTimer); el.dataset.bar = 'shown' }
    const hideSoon = (ms = 500) => {
      if (state.option === 'c' || pinned) return
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => { if (!el.querySelector('.bar, .side')?.matches(':focus-within')) delete el.dataset.bar }, ms)
    }
    el.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return
      if (e.target.closest('.hot, .bar, .side')) show()
    })
    el.addEventListener('pointerout', (e) => {
      if (e.pointerType === 'touch') return
      if (e.target.closest('.hot, .bar, .side') && !e.relatedTarget?.closest?.('.hot, .bar, .side')) { pinned = false; hideSoon() }
    })
    el.addEventListener('pointerleave', () => { if (pinned) { pinned = false; hideSoon(900) } })
    el.addEventListener('focusout', () => hideSoon(200))
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { pinned = false; delete el.dataset.bar } })
    let pull
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.grab')) { pull = e.clientY; return }
      if ((el.dataset.input === 'touch' || e.target.closest('.scrim')) && !e.target.closest('.bar, .side')) { pinned = false; hideSoon(0) }
    })
    el.addEventListener('pointermove', (e) => { if (pull != null && e.clientY - pull > 12) { show(); pull = null } })
    el.addEventListener('pointerup', () => { pull = null })

    el.addEventListener('click', (e) => {
      if (e.target.closest('.grab')) { if (el.dataset.bar === 'shown') delete el.dataset.bar; else show(); return }
      if (e.target.closest('[data-action="fullscreen"]')) {
        if (document.fullscreenElement) document.exitFullscreen?.()
        else el.requestFullscreen?.().catch(() => {})
        return
      }
      const goto = e.target.closest('[data-go]')
      if (goto) { go(goto.dataset.go); return }
      const btn = e.target.closest('.mark')
      if (!btn) return
      const rows = btn.dataset.s === 'food' ? state.food : state.ex
      const row = rows[Number(btn.dataset.r)]
      const c = Number(btn.dataset.c)
      // A press steps an exercise great, partial, missed, then empty; a food great, then empty.
      const cycle = btn.dataset.s === 'food' ? [null, g] : [null, g, p, x]
      row.marks[c] = cycle[(cycle.indexOf(row.marks[c]) + 1) % cycle.length]
      const sc = el.querySelector('.scroller'), top = sc.scrollTop
      render(state)
      el.querySelector('.scroller').scrollTop = top
      el.querySelector(`.mark[data-s="${btn.dataset.s}"][data-r="${btn.dataset.r}"][data-c="${c}"]`)?.focus({ preventScroll: true })
    })
    el.addEventListener('scroll', () => syncDots(state), true)

    new ResizeObserver(measure).observe(el)
    measure()
    if (opts.start === 'food') requestAnimationFrame(() => go('food', false))
    return state
  }

  window.FP = { mount }
})()
