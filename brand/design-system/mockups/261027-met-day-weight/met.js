// The week's Exercises section in normal mode, drawn so a met day's look can be compared in place.
// MD.mount(el, { option }) draws it into el and sizes it from el's own box (met.css), like the
// planner's prototype. option: 'now', or 'b24' | 'b27' (round 2: B at two day-name sizes). The marks are the app's stamped ticks (marks.js);
// the underline strokes are DayMark's MET_UNDERLINES, copied from the source.
(() => {
  const ART = window.FP_ART
  const UNDERLINES = ['M2 4.5C3.1 3.7 6.5 3.3 8.8 2.9C11 2.4 13.3 1.8 15.6 1.6C17.8 1.5 20.1 1.9 22.4 2.1C24.6 2.3 26.9 2.5 29.1 2.9C31.4 3.3 33.7 4.5 35.9 4.7C38.2 4.9 40.5 4.1 42.7 4C45 3.8 47.2 3.7 49.5 3.7C51.8 3.8 54 4.2 56.3 4.2C58.5 4.2 60.8 3.8 63.1 3.7C65.3 3.7 67.6 3.8 69.9 3.6C72.1 3.4 74.4 2.6 76.6 2.5C78.9 2.4 81.2 2.9 83.4 2.8C85.7 2.8 88 1.8 90.2 2C92.5 2.2 95.9 3.2 97 4.2C98.1 5.2 98.1 6.9 97 8.2C95.9 9.4 92.5 11.1 90.2 11.9C88 12.7 85.7 12.7 83.4 13.1C81.2 13.5 78.9 13.9 76.6 14.2C74.4 14.4 72.1 14.3 69.9 14.4C67.6 14.5 65.3 15 63.1 15C60.8 15 58.5 14.5 56.3 14.5C54 14.5 51.8 15 49.5 15C47.2 15.1 45 14.7 42.7 14.7C40.5 14.6 38.2 14.5 35.9 14.6C33.7 14.7 31.4 15.1 29.1 15.1C26.9 15 24.6 14.6 22.4 14.2C20.1 13.8 17.8 13.3 15.6 12.8C13.3 12.3 11 12 8.8 11.2C6.5 10.3 3.1 9 2 7.9C0.9 6.7 0.9 5.4 2 4.5Z',
    'M5 7.2C6.1 5.8 9.5 4.4 11.7 3.6C14 2.7 16.2 2.4 18.4 2.1C20.7 1.7 22.9 1.5 25.1 1.4C27.4 1.3 29.6 1.4 31.9 1.3C34.1 1.2 36.3 0.8 38.6 0.6C40.8 0.5 43 0.1 45.3 0.2C47.5 0.3 49.8 1.2 52 1.2C54.2 1.2 56.5 0.2 58.7 0.1C61 0 63.2 0.3 65.4 0.6C67.7 0.8 69.9 1.7 72.1 1.8C74.4 2 76.6 1.2 78.9 1.3C81.1 1.4 83.3 2 85.6 2.4C87.8 2.9 90 3.3 92.3 4C94.5 4.7 97.9 5.5 99 6.7C100.1 7.8 100.1 9.9 99 11C97.9 12.2 94.5 13.1 92.3 13.7C90 14.2 87.8 14.3 85.6 14.4C83.3 14.4 81.1 14 78.9 13.7C76.6 13.5 74.4 12.7 72.1 12.7C69.9 12.6 67.7 13.2 65.4 13.4C63.2 13.6 61 13.8 58.7 13.7C56.5 13.6 54.2 13 52 12.9C49.8 12.7 47.5 12.8 45.3 12.8C43 12.9 40.8 13.3 38.6 13.2C36.3 13.2 34.1 12.7 31.9 12.7C29.6 12.7 27.4 13.2 25.1 13.4C22.9 13.5 20.7 13.7 18.4 13.7C16.2 13.7 14 13.7 11.7 13.4C9.5 13 6.1 12.7 5 11.7C3.9 10.7 3.9 8.5 5 7.2Z',
    'M0 4C1.1 3.2 4.4 3.2 6.6 2.9C8.9 2.6 11.1 1.9 13.3 1.9C15.5 2 17.7 2.7 19.9 3.1C22.1 3.5 24.4 4 26.6 4.2C28.8 4.3 31 4 33.2 4C35.4 4.1 37.6 4.5 39.9 4.6C42.1 4.6 44.3 4.5 46.5 4.4C48.7 4.2 50.9 3.9 53.1 3.8C55.4 3.8 57.6 4 59.8 4.1C62 4.1 64.2 4.5 66.4 4.3C68.6 4.1 70.9 3.2 73.1 2.8C75.3 2.5 77.5 2.4 79.7 2.4C81.9 2.3 84.1 2.2 86.4 2.5C88.6 2.8 91.9 3.5 93 4.4C94.1 5.3 94.1 6.6 93 7.8C91.9 9.1 88.6 10.8 86.4 11.8C84.1 12.8 81.9 13.6 79.7 13.9C77.5 14.2 75.3 13.3 73.1 13.3C70.9 13.3 68.6 13.7 66.4 14.1C64.2 14.5 62 15.2 59.8 15.5C57.6 15.8 55.4 16.1 53.1 16.1C50.9 16.2 48.7 16 46.5 15.8C44.3 15.6 42.1 14.9 39.9 14.7C37.6 14.5 35.4 15 33.2 14.8C31 14.6 28.8 13.7 26.6 13.6C24.4 13.5 22.1 14.2 19.9 14.1C17.7 14 15.5 13.5 13.3 12.9C11.1 12.3 8.9 11.4 6.6 10.5C4.4 9.6 1.1 8.7 0 7.6C-1.1 6.5 -1.1 4.7 0 4Z']
  const CHECK = '<path d="M20 6 9 17l-5-5"/>'
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const g = 'great', p = 'partial', x = 'missed', _ = null
  const ROWS = [
    { name: 'Push-ups', chips: ['3 × 12'], note: 'Slow on the way down. <a href="#">Form video</a>', marks: [g, _, _, _, _, _, _] },
    { name: 'Squats', chips: ['3 × 15', '16 kg'], marks: [_, g, _, _, _, _, _] },
    { name: 'Plank', chips: ['3 × 45 s'], marks: [g, p, _, _, _, _, _] },
    { name: 'Kettlebell halos', chips: ['8 each side', '12 kg'], marks: [_, _, _, _, _, _, _] },
    { name: 'Pull-ups', chips: ['3 × 5'], marks: [x, g, _, _, _, _, _] },
  ]
  const PICK = 3
  const met = DAYS.map((_, i) => ROWS.filter((r) => r.marks[i]).length >= PICK)
  const check = `<svg class="met-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CHECK}</svg>`
  const mark = (kind) => `<span class="mark"${kind ? ` data-mark="${kind}"` : ''}><svg viewBox="0 0 36 36" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind ? `<path class="ink" d="${ART.stamp}" fill-rule="evenodd"/><path class="sym" d="${ART.ticks[kind]}" fill="none" stroke-width="3.25"/>` : ''}<path class="bx" d="${ART.box}" stroke-width="1.75"/></svg></span>`
  const underline = (i) => `<svg class="met-line" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="${UNDERLINES[i % UNDERLINES.length]}"/></svg>`
  function page() {
    let cells = `<div class="hd corner"></div>` + DAYS.map((d, i) => `<div class="hd"${met[i] ? ' data-met' : ''}><span class="met"><span class="dn">${d}</span>${met[i] ? check : ''}</span>${met[i] ? '<span class="vh">, daily goal met</span>' : ''}</div>`).join('')
    ROWS.forEach((r, ri) => {
      const last = ri === ROWS.length - 1
      const chips = r.chips.map((c) => `<span class="chip">${c}</span>`).join('')
      cells += `<div class="nm"><span class="nl"><span class="n">${r.name}</span>${chips}</span>${r.note ? `<span class="note">${r.note}</span>` : ''}</div>`
      cells += r.marks.map((k, i) => `<div class="d">${mark(k)}${last && met[i] ? underline(i) : ''}</div>`).join('')
    })
    return `<main class="md-page"><header class="md-head"><h2>Exercises</h2><span class="wk">26 Oct – 1 Nov</span></header><div class="grid">${cells}</div></main>`
  }
  function mount(el, opts = {}) {
    el.classList.add('md')
    el.dataset.option = opts.option || 'a'
    el.innerHTML = `<div class="md-scroll">${page()}</div>`
    el.addEventListener('click', (e) => { if (e.target.closest('a')) e.preventDefault() })
  }
  window.MD = { mount }
})()
