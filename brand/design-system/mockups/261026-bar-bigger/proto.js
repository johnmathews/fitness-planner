// The full-screen week as built (the row names of K46), with the bar over it, drawn so the bar's
// options can be tried in place. Copied from 261026-row-name-text.
// TR.mount(el, options) draws one screen into el: Exercises, then Food, a screen each. Options:
//   bar     'now' | 'a' | 'b'   the bar: as shipped, icons over labels, icons beside labels
//   edit    'tile' | 'switch'   how Edit plan shows in the bar
//   shown   true                keep the bar in view (the stills); otherwise the top edge or the handle bring it
//   editPos 'right' | 'mid' | 'start'   where Edit plan sits (round 3)
//   editOn, otherWeek  true     Edit plan pressed, and another week on screen ("This week" shows)
//   start   'exercises' | 'food'   for the stills on the mockup page
// The exercises are the owner's, from their screenshot of 26 October; the food notes are made up.
(() => {
  const ART = window.FP_ART
  const DAYS = [['Mon', 'Monday', 26], ['Tue', 'Tuesday', 27], ['Wed', 'Wednesday', 28], ['Thu', 'Thursday', 29],
    ['Fri', 'Friday', 30], ['Sat', 'Saturday', 31], ['Sun', 'Sunday', 1]]
  const TODAY = 0
  const PICK = 3
  const WEEK = '26 Oct – 1 Nov'
  const g = 'great', p = 'partial', x = 'missed', _ = null
  const EXERCISES = [
    { name: 'Push-ups', chips: ['1 × 12'], marks: [_, g, _, _, _, _, _], note: 'Elbows close to the sides' },
    { name: 'Pull-ups', chips: ['3 reps a set'], marks: [_, _, _, _, _, _, _] },
    { name: 'Squats', chips: ['15 reps a set'], marks: [_, _, p, _, _, _, _] },
    { name: 'Back extensions', chips: ['12 reps a set'], marks: [_, x, _, _, _, _, _] },
    { name: 'Kettlebell halos', chips: ['8 each side'], marks: [_, _, _, _, _, _, _], note: '[https://www.youtube.com/watch?v=IODxDxX7oi4](https://www.youtube.com/watch?v=IODxDxX7oi4)' },
  ]
  const FOODS = [
    { name: 'Vegetables', marks: [g, g, g, _, g, g, _], note: 'Five handfuls' },
    { name: 'Fruit', marks: [_, g, _, g, _, _, _], note: 'Not juice' },
    { name: 'Fish', marks: [_, _, _, g, _, _, _], note: 'Oily fish: [what counts](https://www.nhs.uk/live-well/eat-well/food-types/fish-and-shellfish-nutrition/)' },
    { name: 'Nuts', marks: [g, _, _, _, _, _, _] },
  ]
  const KIND_WORDS = { great: '', partial: ', partly done', missed: ", couldn't do it" }
  const CHECK = '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
  const icon = (d, w = 1.5) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

  // A note's markdown, as the app would render it: emphasis, links and code; no raw HTML.
  function md(src) {
    let s = esc(src)
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>')
    return s
  }
  const plain = (src) => src.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`]/g, '')

  // ---- Question 1: the arrow. A, a bare chevron; B, a chevron in a ring; C, drawn by hand. ----
  const HAND = {
    down: 'M12 3.5C11.8 8.2 12.3 13.4 12.1 19.6M6.4 14.2C8.3 16 10.2 18.1 12.1 20.3C13.9 18 15.8 15.9 17.8 13.8',
    up: 'M12.1 20.5C12.3 15.8 11.8 10.6 12 4.4M17.7 9.8C15.8 8 13.9 5.9 12 3.7C10.2 6 8.3 8.1 6.3 10.2',
  }
  function cue(state, dir, section) {
    const name = section === 'exercises' ? 'Go to Food' : 'Back to Exercises'
    const go = section === 'exercises' ? 'food' : 'exercises'
    const glyph = state.cue === 'c' ? icon(HAND[dir], 2.25) : icon(dir === 'down' ? 'm6 9 6 6 6-6' : 'm18 15-6-6-6 6')
    return `<button type="button" class="cue cue-${dir}" data-go="${go}" aria-label="${name}" title="${name}">${glyph}</button>`
  }

  // ---- Question 2: the note. A, beside the name; B, under it; C, behind an icon. ----
  const NOTE_ICON = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5'
  function noteFor(state, row, key) {
    if (!row.note) return ''
    if (state.notes === 'c') {
      return `<button type="button" class="note-btn" data-note="${key}" aria-label="Note on ${esc(row.name)}" aria-expanded="false">${icon(NOTE_ICON)}</button>`
    }
    return `<span class="note" data-note="${key}" title="${esc(plain(row.note))}">${md(row.note)}</span>`
  }

  function markSvg(kind) {
    const ink = kind
      ? `<path class="ink" d="${ART.stamp}" fill-rule="evenodd"/><path class="sym" d="${ART.ticks[kind]}" fill="none" stroke-width="3.25"/>`
      : ''
    return `<svg viewBox="0 0 36 36" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ink}<path class="bx" d="${ART.box}" stroke-width="1.75"/></svg>`
  }
  function markButton(row, i, section) {
    const kind = row.marks[i]
    const [, full, date] = DAYS[i]
    const label = `${row.name}, ${full} ${date} ${i === 6 ? "November" : "October"}${i === TODAY ? ', today' : ''}${kind ? KIND_WORDS[kind] : ''}`
    return `<button type="button" class="mark" data-s="${section}" data-r="${row.i}" data-c="${i}"${kind ? ` data-mark="${kind}"` : ''} aria-pressed="${Boolean(kind)}" aria-label="${esc(label)}">${markSvg(kind)}</button>`
  }

  const TITLES = { exercises: 'Exercises', food: 'Food' }
  const dayMet = (rows, i, section) => section === 'exercises' && rows.filter((r) => r.marks[i]).length >= PICK
  const ULINE = 'M2 4.5C3.1 3.7 6.5 3.3 8.8 2.9C15.6 1.6 22.4 2.1 29.1 2.9C35.9 4.7 42.7 4 49.5 3.7C56.3 4.2 63.1 3.7 69.9 3.6C76.6 2.5 83.4 2.8 90.2 2C95.9 3.2 98.1 5.2 97 8.2C95.9 9.4 92.5 11.1 90.2 11.9C83.4 13.1 76.6 14.2 69.9 14.4C63.1 15 56.3 14.5 49.5 15C42.7 14.7 35.9 14.6 29.1 15.1C22.4 14.2 15.6 12.8 8.8 11.2C3.1 9 0.9 6.7 2 4.5Z'
  const underline = () => `<svg class="uline" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="${ULINE}"/></svg>`
  const heads = (rows, section) => DAYS.map(([short, , date], i) => {
    const met = dayMet(rows, i, section)
    return `<div class="hd${i === TODAY ? ' today' : ''}${met ? ' met' : ''}"><span class="dn">${short}${met ? CHECK : ''}</span><span class="vh"> ${date}</span></div>`
  }).join('')
  const boxes = (rows, row, section) => row.marks.map((_, i) => {
    const met = dayMet(rows, i, section)
    const last = row.i === rows.length - 1
    return `<div class="d${i === TODAY ? ' today' : ''}${met ? ' met' : ''}${last ? ' last' : ''}">${markButton(row, i, section)}${met && last ? underline() : ''}</div>`
  }).join('')

  // ---- The week, wide: a desktop, an iPad, a phone on its side. ----
  function wideScreen(state, section, rows) {
    let cells = `<div class="hd corner"><span class="vh">${section === 'food' ? 'Food' : 'Exercise'}</span></div>` + heads(rows, section)
    for (const row of rows) {
      const chips = row.chips?.length ? `<span class="chips">${row.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</span>` : ''
      const note = noteFor(state, row, `${section}-${row.i}`)
      // B, round 2: the chips join the name's line and the note takes the second, so a row is two
      // lines of text (three when one wraps).
      const name = state.notes === 'b'
        ? `<span class="nl"><span class="n">${esc(row.name)}</span>${chips}</span>${note}`
        : `<span class="nl"><span class="n">${esc(row.name)}</span>${note}</span>${chips}`
      cells += `<div class="nm">${name}</div>` + boxes(rows, row, section)
    }
    const top = section === 'food' && !state.short ? cue(state, 'up', section) : ''
    const foot = section === 'exercises' && !state.short ? cue(state, 'down', section) : ''
    return `<section class="screen" data-section="${section}" aria-label="${TITLES[section]}">${top}<header class="head"><h2>${TITLES[section]}<span class="wk">${WEEK}</span></h2></header><div class="grid" style="--rows:${rows.length}">${cells}</div>${foot}</section>`
  }

  // ---- A phone held upright: the week, narrow. ----
  function narrowWeek(state, section, rows) {
    let cells = heads(rows, section)
    for (const row of rows) {
      const chip = (row.chips || []).slice(0, 1).map((c) => `<span class="chip">${esc(c)}</span>`).join('')
      const note = noteFor(state, row, `${section}-${row.i}`)
      const line = state.notes === 'b'
        ? `<div class="line"><span class="n">${esc(row.name)}</span>${chip}</div>${note ? `<div class="line under">${note}</div>` : ''}`
        : `<div class="line"><span class="n">${esc(row.name)}</span>${note}${chip}</div>`
      cells += line + boxes(rows, row, section)
    }
    const top = section === 'food' ? cue(state, 'up', section) : ''
    const foot = section === 'exercises' ? cue(state, 'down', section) : ''
    return `<section class="screen" data-section="${section}" aria-label="${TITLES[section]}">${top}<header class="head"><h2>${TITLES[section]}</h2></header><div class="ngrid" style="--t:${TODAY}">${cells}</div>${foot}</section>`
  }

  // ---- The bar (this mockup's question). ----
  const ICON = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.BAR_ART.icons[name]}</svg>`
  const WORDMARK = () => `<svg class="wm" viewBox="${window.BAR_ART.wordmark.viewBox}" role="img" aria-label="Tracker"><path d="${window.BAR_ART.wordmark.path}"/></svg>`
  function bar(state) {
    const week = state.otherWeek ? '2–8 Nov' : WEEK
    const nav = `<nav class="nb-week" aria-label="Week"><button type="button" class="nb-arrow" aria-label="Previous week">${ICON('chevron-left')}</button><span class="nb-label" aria-live="polite">${week}</span><button type="button" class="nb-arrow" aria-label="Next week">${ICON('chevron-right')}</button></nav>`
    if (state.bar === 'now') {
      const sw = `<button type="button" class="switch" role="switch" aria-checked="${state.editOn}"><span>Edit plan</span><span class="track"><span class="thumb"></span></span></button>`
      return `<header class="nb nb-now"><div class="nb-in"><div class="nb-start">${WORDMARK()}</div>${nav}<div class="nb-end">${state.otherWeek ? '<button type="button" class="btn">This week</button>' : ''}${sw}<button type="button" class="icon-btn" aria-label="Full screen">${ICON('maximize')}</button><button type="button" class="icon-btn" aria-label="Settings">${ICON('settings')}</button><button type="button" class="btn">Print…</button></div></div></header>`
    }
    const tile = (icon, label, extra = '') => `<button type="button" class="nb-tile"${extra}>${icon}<span class="nb-name">${label}</span></button>`
    const edit = state.edit === 'switch'
      ? `<button type="button" class="nb-tile" role="switch" aria-checked="${state.editOn}"><span class="nb-switch"><span class="nb-thumb"></span></span><span class="nb-name">Edit plan</span></button>`
      : tile(ICON('pencil'), 'Edit plan', ` aria-pressed="${state.editOn}"`)
    const narrow = state.layout === 'narrow'
    // Round 2: Edit plan sits just right of the wordmark, and Full screen is the last action.
    // Round 3: where Edit plan sits. 'right', in the actions' group just left of Settings;
    // 'mid', halfway between the wordmark and the week; 'start', just right of the wordmark (round 2).
    const pos = state.editPos
    // In A "This week" moves beside the week's arrows, so the right-hand group stays narrow
    // enough for the week to keep the centre.
    const thisWeek = state.otherWeek ? tile(ICON('calendar'), 'This week') : ''
    const tiles = [
      pos === 'right' ? '' : thisWeek,
      pos === 'right' ? edit : '',
      tile(ICON('settings'), 'Settings'),
      narrow ? '' : tile(ICON('printer'), 'Print…'),
      narrow ? '' : tile(ICON('maximize'), 'Full screen'),
    ].join('')
    const start = pos === 'start' ? `${WORDMARK()}${edit}` : pos === 'mid' ? `${WORDMARK()}<div class="nb-mid">${edit}</div>` : `${WORDMARK()}${thisWeek ? `<div class="nb-near">${thisWeek}</div>` : ''}`
    return `<header class="nb"><div class="nb-in"><div class="nb-start">${start}</div>${nav}<div class="nb-end">${tiles}</div></div></header>`
  }
  function wireBar(state) {
    const el = state.el
    if (state.shown) return
    let timer = 0
    const show = () => { clearTimeout(timer); el.dataset.bar = 'shown' }
    const hide = () => { clearTimeout(timer); timer = setTimeout(() => { if (!el.querySelector('.nb:focus-within')) delete el.dataset.bar }, 500) }
    el.addEventListener('pointerover', (e) => { if (e.target.closest('.nb-hot, .nb')) show() })
    el.addEventListener('pointerout', (e) => { if (e.target.closest('.nb') && !e.relatedTarget?.closest?.('.nb')) hide() })
    el.addEventListener('click', (e) => {
      if (e.target.closest('.nb-grab')) {
        if (el.dataset.bar === 'shown') delete el.dataset.bar
        else el.dataset.bar = 'shown'
        return
      }
      const t = e.target.closest('.nb-tile[aria-pressed], .nb-tile[role="switch"], .nb .switch')
      if (t) {
        state.editOn = !state.editOn
        t.setAttribute(t.hasAttribute('aria-pressed') ? 'aria-pressed' : 'aria-checked', String(state.editOn))
      }
    })
  }

  function render(state) {
    const screen = state.layout === 'narrow' ? narrowWeek : wideScreen
    state.el.innerHTML = `<div class="scroller">${screen(state, 'exercises', state.ex)}${screen(state, 'food', state.food)}</div>${bar(state)}<div class="nb-hot" aria-hidden="true"></div><button type="button" class="nb-grab" aria-label="Show controls"><span></span></button><div class="pop" role="dialog" aria-label="Note" hidden></div>`
  }

  // ---- Question 4: the sprint. ----
  // Old: as shipped (K38), once the scroll has rested for 120 ms. New: as soon as the line between
  // two screens comes into the window by a step, while the wheel or the fling is still going. The
  // jump takes 260 ms and owns the page while it runs; the wheel's momentum after it is swallowed.
  const REST_MS = 120
  const SPRINT_MS = 260
  const QUIET_MS = 180
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

  /** Where to go, or null: a line strictly inside the window by more than `step`. */
  function target(top, height, starts, direction, step) {
    for (const line of starts.slice(1)) {
      if (line > top + step && line < top + height - step) {
        const down = direction === 0 ? line - top < height / 2 : direction > 0
        return down ? line : line - height
      }
    }
    return null
  }

  function sprinter(state) {
    const sc = () => state.el.querySelector('.scroller')
    let last = 0, direction = 1, timer, running = false, quietUntil = 0, finger = false
    const starts = () => [...state.el.querySelectorAll('.screen')].map((s) => s.offsetTop)

    function to(top) {
      const el = sc()
      if (reduced()) { el.scrollTop = top; return }
      const from = el.scrollTop, t0 = performance.now()
      running = true
      const step = (now) => {
        const k = Math.min(1, (now - t0) / SPRINT_MS)
        el.scrollTop = from + (top - from) * (1 - (1 - k) ** 3)
        if (k < 1) requestAnimationFrame(step)
        else { running = false; last = el.scrollTop; quietUntil = performance.now() + QUIET_MS }
      }
      requestAnimationFrame(step)
    }
    function settle(step) {
      const el = sc()
      const t = target(el.scrollTop, el.clientHeight, starts(), direction, step)
      if (t !== null) to(t)
    }
    function onScroll() {
      if (running) return
      const el = sc(), now = el.scrollTop
      if (now !== last) direction = now > last ? 1 : -1
      last = now
      clearTimeout(timer)
      if (state.sprint === 'new' && !finger) {
        // A step of 4% of the window: a nudge past the end of a screen is enough.
        const stepPx = Math.max(16, el.clientHeight * 0.04)
        if (target(now, el.clientHeight, starts(), direction, stepPx) !== null) { settle(stepPx); return }
      }
      timer = setTimeout(() => settle(1), REST_MS)
    }
    // While the jump runs, and while the wheel's momentum is still arriving after it, the page
    // ignores the wheel; a fresh flick after a quiet moment scrolls again.
    function onWheel(e) {
      if (state.sprint !== 'new') return
      const now = performance.now()
      if (running || now < quietUntil) { e.preventDefault(); quietUntil = now + QUIET_MS }
    }
    function onTouchMove(e) { if (state.sprint === 'new' && running) e.preventDefault() }
    const root = state.el
    root.addEventListener('scroll', (e) => { if (e.target.classList?.contains('scroller')) onScroll() }, true)
    root.addEventListener('wheel', onWheel, { passive: false })
    root.addEventListener('touchstart', () => { finger = true }, { passive: true })
    root.addEventListener('touchmove', onTouchMove, { passive: false })
    root.addEventListener('touchend', () => { finger = false; onScroll() }, { passive: true })
    return { to, reset: () => { last = sc()?.scrollTop || 0 } }
  }

  function mount(el, opts = {}) {
    const clone = (rows) => rows.map((r, i) => ({ ...r, i, marks: [...r.marks] }))
    const state = { el, cue: 'a', notes: 'b', sprint: 'new', size: 'a', bar: opts.bar || 'a', edit: opts.edit || 'tile', editOn: !!opts.editOn, editPos: opts.editPos || 'right', otherWeek: !!opts.otherWeek, shown: !!opts.shown, ex: clone(EXERCISES), food: clone(FOODS), layout: '', short: false }
    el.classList.add('fs')
    el.dataset.cue = state.cue
    el.dataset.notes = state.notes
    el.dataset.size = state.size
    el.dataset.barStyle = state.bar
    el.dataset.edit = state.edit
    if (state.shown) el.dataset.bar = 'shown'
    const sprint = sprinter(state)
    wireBar(state)

    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight
      const layout = h > w && w < 1000 ? 'narrow' : 'wide'
      el.dataset.device = w < 640 || h < 640 ? 'phone' : 'tablet'
      const short = layout === 'wide' && h <= 540
      if (layout === state.layout && short === state.short) return
      const sc = el.querySelector('.scroller')
      const onFood = sc && sc.scrollTop > sc.clientHeight / 2
      state.layout = layout; state.short = short
      el.dataset.layout = layout
      render(state)
      if (onFood) go('food', false)
      sprint.reset()
    }
    const go = (section, smooth = true) => {
      const top = el.querySelector(`.screen[data-section="${section}"]`).offsetTop
      if (smooth) sprint.to(top)
      else { el.querySelector('.scroller').scrollTop = top; sprint.reset() }
    }

    const pop = () => el.querySelector('.pop')
    function closePop() {
      const p = pop()
      if (!p || p.hidden) return
      p.hidden = true
      el.querySelector('[data-note][aria-expanded="true"]')?.setAttribute('aria-expanded', 'false')
    }
    function openPop(anchor) {
      const [s, r] = anchor.dataset.note.split('-')
      const row = (s === 'food' ? state.food : state.ex)[Number(r)]
      const p = pop()
      p.innerHTML = `<p class="pop-name">${esc(row.name)}</p><p class="pop-body">${md(row.note)}</p>`
      p.hidden = false
      const a = anchor.getBoundingClientRect(), box = el.getBoundingClientRect()
      const scale = box.width / el.offsetWidth || 1
      const left = Math.min((a.left - box.left) / scale, el.offsetWidth - p.offsetWidth - 12)
      p.style.left = Math.max(12, left) + 'px'
      p.style.top = ((a.bottom - box.top) / scale + 6) + 'px'
      anchor.setAttribute('aria-expanded', 'true')
    }

    el.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop() })
    el.addEventListener('click', (e) => {
      if (e.target.closest('a')) return
      if (e.target.closest('.pop')) return
      const note = e.target.closest('[data-note]')
      if (note) { const open = note.getAttribute('aria-expanded') === 'true'; closePop(); if (!open) openPop(note); return }
      closePop()
      const goto = e.target.closest('[data-go]')
      if (goto) { go(goto.dataset.go); return }
      const btn = e.target.closest('.mark')
      if (!btn) return
      const rows = btn.dataset.s === 'food' ? state.food : state.ex
      const row = rows[Number(btn.dataset.r)]
      const c = Number(btn.dataset.c)
      const cycle = btn.dataset.s === 'food' ? [null, g] : [null, g, p, x]
      row.marks[c] = cycle[(cycle.indexOf(row.marks[c]) + 1) % cycle.length]
      const top = el.querySelector('.scroller').scrollTop
      render(state)
      el.querySelector('.scroller').scrollTop = top
      sprint.reset()
      el.querySelector(`.mark[data-s="${btn.dataset.s}"][data-r="${btn.dataset.r}"][data-c="${c}"]`)?.focus({ preventScroll: true })
    })

    new ResizeObserver(measure).observe(el)
    measure()
    if (opts.start === 'food') requestAnimationFrame(() => go('food', false))
    return state
  }

  window.TR = { mount }
})()
