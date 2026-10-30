/* 골프 레슨 영어: 화면과 동작 */
(function () {
  'use strict';

  const D = window.GOLF_DATA;
  const L = window.GolfLogic;
  const CLUBS = D.CLUBS;
  const PHASES = D.PHASES;
  const S = D.SENTENCES;

  /* ───────── 작은 도우미 ───────── */
  const $ = (sel, el) => (el || document).querySelector(sel);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const byId = {};
  S.forEach(s => { byId[s.id] = s; });
  const clubOf = id => CLUBS.find(c => c.id === id);
  const phaseNo = s => PHASES.findIndex(p => p.id === s.phase) + 1;
  const phaseName = s => s.phaseKo || PHASES[phaseNo(s) - 1].ko;
  const teeColor = club => 'var(--tee-' + club.marker + ')';

  // h('div', {class:'a', onclick: fn}, '글자', 자식요소) → 요소 만들기
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    });
    kids.flat(Infinity).forEach(kid => {
      if (kid == null || kid === false) return;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    });
    return el;
  }

  const ICONS = {
    flag: '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M9 3v25" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/><path class="cloth" d="M10.3 4.4 27 10.2 10.3 16z" fill="var(--flag-fill)"/><ellipse cx="9" cy="29" rx="6" ry="1.7" fill="currentColor" opacity=".3"/></svg>',
    mic: '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" focusable="false"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>'
  };
  function icon(name) {
    const s = document.createElement('span');
    s.className = 'ico';
    s.innerHTML = ICONS[name];
    return s;
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3600);
  }

  /* ───────── 저장되는 상태 (이 기기, 이 브라우저에만 저장돼요) ───────── */
  const KEY = 'golf-english-v1';

  function loadState() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    const st = Object.assign({
      startDate: L.todayStr(), done: {}, voiceURI: '', rate: 0.92, pitch: 0.85, hideEn: false, stats: {}
    }, saved);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(st.startDate) || L.dayNumberOf(st.startDate) < 1) st.startDate = L.todayStr();
    st.rate = clamp(Number(st.rate) || 0.92, 0.5, 1.4);
    st.pitch = clamp(Number(st.pitch) || 0.85, 0.5, 1.5);
    if (!st.done || typeof st.done !== 'object') st.done = {};
    if (!st.stats || typeof st.stats !== 'object') st.stats = {};
    st._fresh = !saved.startDate;
    return st;
  }
  function saveState() {
    try {
      const copy = Object.assign({}, state);
      delete copy._fresh;
      localStorage.setItem(KEY, JSON.stringify(copy));
    } catch (e) { /* 저장 공간이 막힌 브라우저에서는 이번 방문에만 기억해요 */ }
  }

  let state = loadState();
  if (state._fresh) saveState(); // 처음 연 날을 1일차로 고정

  const plan = L.buildPlan(S.map(s => s.id), D.PLAN_DAYS, D.PLAN_SEED);
  const currentDay = () => L.dayNumberOf(state.startDate);
  const todayIndex = () => clamp(currentDay(), 1, D.PLAN_DAYS);
  const todaySentence = () => byId[plan[todayIndex() - 1]];

  const VIEWS = ['today', 'clubs', 'practice', 'sound'];
  const ui = { view: 'today', viewDay: null, club: 'all', scope: 'today', mode: 'speak', pid: null, stamp: L.todayStr() };

  /* ───────── 영어 음성 (미국 남성 목소리를 우선 고르기) ───────── */
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // 차분하고 힘 있는 남성 목소리를 앞에 둔 순서 (Windows/Edge, macOS, iOS, Android 이름 모두 포함)
  const MALE_PREFS = [/davis/i, /andrew/i, /christopher/i, /guy/i, /brian/i, /eric/i, /roger/i, /steffan/i,
    /\balex\b/i, /evan/i, /aaron/i, /nathan/i, /\btom\b/i, /reed/i, /\bfred\b/i, /\bdavid\b/i, /\bmark\b/i, /james/i, /ryan/i];
  const FEMALE = /zira|samantha|victoria|karen|susan|allison|\bava\b|aria|jenny|michelle|emma|nicky|kathy|fiona|moira|tessa|salli|joanna|kendra|kimberly|ivy|female|sara|heather|linda|hazel|libby|sonia|maisie|\bamy\b|catherine|serena|ellen/i;

  function scoreVoice(v) {
    const lang = (v.lang || '').replace('_', '-');
    if (!/^en/i.test(lang)) return -1000;
    let sc = /^en-US$/i.test(lang) ? 100 : /^en-(GB|AU|CA|IE|IN|ZA)/i.test(lang) ? 20 : 10;
    const i = MALE_PREFS.findIndex(re => re.test(v.name));
    if (i >= 0) sc += 200 - i * 5;
    if (FEMALE.test(v.name)) sc -= 150;
    if (/natural|neural|online/i.test(v.name)) sc += 25;
    if (/premium|enhanced/i.test(v.name)) sc += 15;
    if (/google/i.test(v.name)) sc -= 10;
    return sc;
  }

  let voices = [];          // [{ v, score }] 점수 높은 순
  let activeVoice = null;
  function refreshVoices() {
    if (!synth) return;
    voices = synth.getVoices()
      .filter(v => /^en/i.test((v.lang || '').replace('_', '-')))
      .map(v => ({ v, score: scoreVoice(v) }))
      .sort((a, b) => b.score - a.score);
    const saved = voices.find(x => x.v.voiceURI === state.voiceURI);
    activeVoice = saved ? saved.v : (voices[0] ? voices[0].v : null);
  }

  let playToken = 0;
  let playingBtn = null;
  let audioEl = null;
  let utterance = null;     // 브라우저가 재생 중에 지워 버리지 않도록 붙잡아 둬요
  let recognizer = null;

  function setPlaying(btn) {
    if (playingBtn) playingBtn.classList.remove('is-playing');
    playingBtn = btn || null;
    if (btn) btn.classList.add('is-playing');
  }

  function stopAudio() {
    playToken++;
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
    if (audioEl) { try { audioEl.pause(); } catch (e) { /* 무시 */ } audioEl = null; }
    setPlaying(null);
  }

  function speakText(text, o) {
    o = o || {};
    if (!synth) {
      toast('이 브라우저는 영어 음성 재생을 지원하지 않아요. Chrome, Edge, Safari에서 열어 주세요.');
      return;
    }
    const wasBusy = synth.speaking || synth.pending;
    stopAudio();
    const token = playToken;
    setPlaying(o.btn);
    const run = () => {
      if (token !== playToken) return;
      const u = new SpeechSynthesisUtterance(text);
      if (activeVoice) { u.voice = activeVoice; u.lang = activeVoice.lang; } else { u.lang = 'en-US'; }
      u.rate = clamp(state.rate * (o.slow ? 0.72 : 1), 0.4, 1.6);
      u.pitch = state.pitch;
      const end = () => { if (token === playToken) setPlaying(null); };
      u.onend = end;
      u.onerror = end;
      utterance = u;
      synth.speak(u);
    };
    if (wasBusy) setTimeout(run, 70); else run();
  }

  // audio/<id>.mp3 가 있으면 녹음 파일을 먼저 재생하고, 없으면 기기 음성으로 읽어요
  function playSentence(s, o) {
    o = o || {};
    if (D.USE_RECORDED_AUDIO) {
      stopAudio();
      const token = playToken;
      const a = new Audio('audio/' + s.id + '.mp3');
      audioEl = a;
      a.playbackRate = o.slow ? 0.75 : 1;
      let fell = false;
      const fallback = () => {
        if (fell || token !== playToken) return;
        fell = true; audioEl = null;
        speakText(s.en, o);
      };
      a.addEventListener('error', fallback);
      a.addEventListener('ended', () => { if (token === playToken) setPlaying(null); });
      setPlaying(o.btn);
      const p = a.play();
      if (p && p.catch) p.catch(fallback);
      return;
    }
    speakText(s.en, o);
  }

  function stopListening() {
    if (recognizer) { try { recognizer.abort(); } catch (e) { /* 무시 */ } recognizer = null; }
  }
  function stopAll() { stopAudio(); stopListening(); }

  /* ───────── 공통 조각 ───────── */
  function sayButton(s, o) {
    o = o || {};
    const btn = h('button', {
      type: 'button',
      class: 'say' + (o.small ? ' sm' : ''),
      'aria-label': s.ko + ' (누르면 영어로 읽어줘요)'
    }, icon('flag'), h('span', {}, s.ko));
    btn.addEventListener('click', () => playSentence(s, { btn }));
    return btn;
  }

  function enLine(s) {
    return h('p', { class: 'en', lang: 'en', onclick: e => e.currentTarget.classList.toggle('revealed') }, s.en);
  }

  function slowBtn(s) {
    const btn = h('button', { type: 'button', class: 'btn' }, '천천히 듣기');
    btn.addEventListener('click', () => playSentence(s, { slow: true, btn: null }));
    return btn;
  }

  function hideBtn() {
    return h('button', {
      type: 'button', class: 'btn ghost',
      onclick: () => { state.hideEn = !state.hideEn; saveState(); render(); }
    }, state.hideEn ? '영어 보이기' : '영어 가리기');
  }

  function metaRow(s) {
    const club = clubOf(s.club);
    const n = phaseNo(s);
    return h('div', { class: 'meta' },
      h('span', { class: 'club-tag' }, h('i', { class: 'dot', style: '--club:' + teeColor(club) }), club.ko),
      h('span', { class: 'phase' },
        h('span', { class: 'steps', 'aria-hidden': 'true' },
          PHASES.map((p, i) => h('i', { class: i + 1 < n ? 'on' : (i + 1 === n ? 'now' : '') }))),
        h('b', {}, n), phaseName(s)));
  }

  /* ───────── 1. 오늘 ───────── */
  function progressGrid(dn, viewDay) {
    const cells = [];
    for (let d = 1; d <= D.PLAN_DAYS; d++) {
      const cls = ['cell'];
      if (state.done[d]) cls.push('done');
      if (d === dn) cls.push('today');
      if (d === viewDay) cls.push('view');
      cells.push(h('button', {
        type: 'button', class: cls.join(' '), disabled: d > dn,
        'aria-label': d + '일차' + (state.done[d] ? ' 완료' : ''),
        'aria-current': d === viewDay ? 'true' : null,
        onclick: () => { ui.viewDay = d; renderToday(); }
      }));
    }
    return h('div', { class: 'grid80', role: 'group', 'aria-label': D.PLAN_DAYS + '일 진행표' }, cells);
  }

  function restartCourse() {
    if (!window.confirm('오늘을 1일차로 해서 처음부터 다시 시작할까요? 지금까지의 완료 표시는 지워져요.')) return;
    state.startDate = L.todayStr();
    state.done = {};
    ui.viewDay = null;
    saveState();
    renderToday();
  }

  function renderToday() {
    const root = $('#view-today');
    root.replaceChildren();
    const total = D.PLAN_DAYS;
    const dn = currentDay();
    const cap = Math.min(dn, total);
    const view = ui.viewDay == null ? cap : clamp(ui.viewDay, 1, cap);
    ui.viewDay = view;
    const s = byId[plan[view - 1]];
    const club = clubOf(s.club);
    const doneCount = Object.keys(state.done).filter(k => state.done[k] && +k >= 1 && +k <= total).length;
    const streak = L.streakOf(state.done, cap);

    if (!synth) {
      root.append(h('div', { class: 'banner warn' }, h('p', {}, '이 브라우저는 영어 음성을 지원하지 않아요. Chrome, Edge, Safari로 열어 주세요.')));
    }
    if (dn > total) {
      root.append(h('div', { class: 'banner' },
        h('p', {}, total + '일 코스를 마쳤어요. ' + doneCount + '일을 학습했어요.'),
        h('button', { type: 'button', class: 'btn primary', onclick: restartCourse }, '오늘부터 다시 시작')));
    }

    const label = view === dn ? '오늘의 문장' : (dn > total && view === total ? '마지막 날 문장' : (dn - view) + '일 전 문장');

    root.append(
      h('div', { class: 'daybar' },
        h('div', { class: 'daycount' },
          h('span', { class: 'daynum' }, view),
          h('span', { class: 'daytotal' }, '/ ' + total + '일'),
          h('span', { class: 'daylabel' }, label)),
        h('div', { class: 'daynav' },
          h('button', { type: 'button', class: 'iconbtn', 'aria-label': '이전 날', disabled: view <= 1, onclick: () => { ui.viewDay = view - 1; renderToday(); } }, '‹'),
          h('button', { type: 'button', class: 'iconbtn', 'aria-label': '다음 날', disabled: view >= cap, onclick: () => { ui.viewDay = view + 1; renderToday(); } }, '›'))),
      progressGrid(dn, view),
      h('p', { class: 'tally' },
        h('span', {}, h('b', {}, doneCount), '일 완료'),
        streak > 1 ? h('span', {}, h('b', {}, streak), '일 연속') : null),
      h('section', { class: 'sheet', style: '--club:' + teeColor(club) },
        metaRow(s),
        h('p', { class: 'hint' }, '한국어 문장을 누르면 영어로 들려줘요.'),
        sayButton(s),
        enLine(s),
        h('div', { class: 'actions' },
          slowBtn(s),
          hideBtn(),
          h('button', {
            type: 'button', class: 'btn',
            onclick: () => go('practice', { scope: view === dn ? 'today' : 'all', pid: s.id, mode: 'speak' })
          }, '따라 말하기')),
        h('button', {
          type: 'button', class: 'btn done' + (state.done[view] ? ' on' : ''),
          'aria-pressed': String(!!state.done[view]),
          onclick: () => { state.done[view] = !state.done[view]; saveState(); renderToday(); }
        }, (state.done[view] ? '✓ ' : '') + (view === dn ? '오늘 학습 완료' : view + '일차 학습 완료'))));
  }

  /* ───────── 2. 클럽별 ───────── */
  function clubSheet(club) {
    const rows = S.filter(s => s.club === club.id).sort((a, b) => phaseNo(a) - phaseNo(b));
    return h('section', { class: 'card-sheet', style: '--club:' + teeColor(club) },
      h('header', { class: 'sheet-head' },
        h('i', { class: 'dot lg' }),
        h('h2', {}, club.ko),
        h('span', { class: 'en-name', lang: 'en' }, club.en)),
      rows.map(s => h('article', { class: 'hole' },
        h('div', { class: 'hole-no' }, h('b', {}, phaseNo(s)), h('span', {}, phaseName(s))),
        h('div', { class: 'hole-body' },
          sayButton(s, { small: true }),
          enLine(s),
          h('div', { class: 'actions tight' },
            slowBtn(s),
            h('button', {
              type: 'button', class: 'btn ghost',
              onclick: () => go('practice', { scope: s.club, pid: s.id, mode: 'speak' })
            }, '연습'))))));
  }

  function renderClubs() {
    const root = $('#view-clubs');
    root.replaceChildren();
    const chip = (id, label, club) => h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(ui.club === id),
      onclick: () => { ui.club = id; renderClubs(); }
    }, club ? h('i', { class: 'dot', style: '--club:' + teeColor(club) }) : null, label);

    root.append(
      h('div', { class: 'chips', role: 'group', 'aria-label': '클럽 선택' },
        chip('all', '전체'), CLUBS.map(c => chip(c.id, c.ko, c))),
      h('div', { class: 'actions' }, hideBtn()),
      ...(ui.club === 'all' ? CLUBS : [clubOf(ui.club)]).map(clubSheet));
  }

  /* ───────── 3. 연습 ───────── */
  const freshQ = () => ({ result: null, error: '', listening: false, picked: new Set(), correct: false, hint: false, options: null, answer: '', reveal: false });
  let Q = freshQ();
  const session = { ok: 0, tries: 0 };

  function pool() {
    if (ui.scope === 'today') return [todaySentence()];
    if (ui.scope === 'all') return S;
    return S.filter(s => s.club === ui.scope);
  }

  function nextSentence() {
    const p = pool();
    const others = p.filter(s => s.id !== ui.pid);
    const list = others.length ? others : p;
    ui.pid = list[Math.floor(Math.random() * list.length)].id;
    Q = freshQ();
    renderPractice();
  }

  function setScope(id) {
    ui.scope = id;
    if (id === 'today') ui.pid = todaySentence().id;
    else if (!pool().some(s => s.id === ui.pid)) { ui.pid = null; nextSentence(); return; }
    Q = freshQ();
    renderPractice();
  }

  function recordScore(s, score) {
    const st = state.stats[s.id] || { best: 0, tries: 0 };
    st.tries += 1;
    st.best = Math.max(st.best, score);
    state.stats[s.id] = st;
    saveState();
  }

  function statLine(s) {
    const st = state.stats[s.id];
    return st ? h('p', { class: 'stat' }, '이 문장 최고 ' + st.best + '점 (연습 ' + st.tries + '회)') : null;
  }

  function resultBlock(r) {
    const msg = r.score >= 90 ? '완벽해요' : r.score >= 70 ? '좋아요' : '한 번 더 해 봐요';
    return h('div', { class: 'result', role: 'status' },
      h('div', { class: 'score' }, h('span', { class: 'num' }, r.score), h('span', { class: 'msg' }, msg)),
      h('p', { class: 'words', lang: 'en' }, r.words.map(w => h('span', { class: w.ok ? 'ok' : 'miss' }, w.text, ' '))),
      r.heard ? h('p', { class: 'heard' }, '인식된 말: ' + r.heard) : null);
  }

  /* 3-1. 따라 말하기 */
  const SR_ERRORS = {
    'not-allowed': '마이크 사용이 막혀 있어요. 주소창 옆 자물쇠 아이콘에서 마이크를 허용해 주세요.',
    'service-not-allowed': '마이크 사용이 막혀 있어요. 주소창 옆 자물쇠 아이콘에서 마이크를 허용해 주세요.',
    'no-speech': '소리가 들리지 않았어요. 마이크를 누르고 다시 말해 보세요.',
    'audio-capture': '마이크를 찾지 못했어요. 기기에 마이크가 연결돼 있는지 확인해 주세요.',
    'network': '음성 인식 서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.'
  };

  function startListening(s) {
    stopAll();
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    recognizer = rec;
    Q.listening = true; Q.result = null; Q.error = '';
    renderPractice();
    let got = false;
    rec.onresult = e => {
      got = true;
      const res = e.results[0];
      let best = null;
      for (let i = 0; i < res.length; i++) {
        const r = L.scoreAnswer(s.en, res[i].transcript);
        if (!best || r.score > best.score) best = Object.assign(r, { heard: res[i].transcript });
      }
      Q.result = best;
      recordScore(s, best.score);
    };
    rec.onerror = e => { if (e.error !== 'aborted') Q.error = SR_ERRORS[e.error] || '음성 인식에 문제가 생겼어요. 한 번 더 해 주세요.'; };
    rec.onend = () => {
      if (recognizer === rec) recognizer = null;
      Q.listening = false;
      if (!got && !Q.error) Q.error = SR_ERRORS['no-speech'];
      if (ui.view === 'practice' && ui.mode === 'speak' && ui.pid === s.id) renderPractice();
    };
    try { rec.start(); } catch (err) { Q.listening = false; Q.error = SR_ERRORS['audio-capture']; renderPractice(); }
  }

  function micBlock(s) {
    if (!SR) {
      return h('div', { class: 'mic-block col' },
        h('p', { class: 'note' }, '이 브라우저는 음성 인식을 지원하지 않아요. 소리 내어 말한 뒤 직접 체크해 보세요. (음성 인식은 Chrome, Edge, Safari에서 돼요.)'),
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => { recordScore(s, 100); toast('좋아요! 다음 문장으로 가 볼까요?'); } }, '잘 말했어요'),
          h('button', { type: 'button', class: 'btn', onclick: () => playSentence(s, { slow: true }) }, '다시 듣기')));
    }
    return h('div', { class: 'mic-block' },
      h('button', {
        type: 'button', class: 'mic' + (Q.listening ? ' is-listening' : ''),
        'aria-label': Q.listening ? '듣는 중입니다. 누르면 멈춰요' : '마이크를 켜고 영어로 말하기',
        onclick: () => { if (Q.listening) { stopListening(); } else { startListening(s); } }
      }, icon('mic')),
      h('p', { class: 'mic-hint' }, Q.listening ? '듣고 있어요. 영어로 말해 보세요.' : '마이크를 누르고 영어로 말해 보세요.'));
  }

  function speakCard(s) {
    const club = clubOf(s.club);
    return h('section', { class: 'sheet', style: '--club:' + teeColor(club) },
      metaRow(s),
      sayButton(s),
      enLine(s),
      h('div', { class: 'actions' }, slowBtn(s), hideBtn()),
      micBlock(s),
      Q.error ? h('p', { class: 'error', role: 'alert' }, Q.error) : null,
      Q.result ? resultBlock(Q.result) : null,
      statLine(s));
  }

  /* 3-2. 빈칸 채우기 */
  function pickOption(s, w) {
    if (Q.correct || Q.picked.has(w)) return;
    if (Q.picked.size === 0) { session.tries += 1; if (w === s.key.toLowerCase()) session.ok += 1; }
    Q.picked.add(w);
    if (w === s.key.toLowerCase()) {
      Q.correct = true;
      renderPractice();
      playSentence(s);
    } else {
      renderPractice();
    }
  }

  function blankCard(s) {
    const club = clubOf(s.club);
    const blank = L.makeBlank(s.en, s.key);
    if (!blank) {
      return h('section', { class: 'sheet' }, h('p', {}, '이 문장은 빈칸을 만들 수 없어요. 다음 문장으로 넘어가 주세요.'),
        h('button', { type: 'button', class: 'btn primary', onclick: nextSentence }, '다음 문장'));
    }
    if (!Q.options) Q.options = L.pickOptions(s, S);
    const upper = /^[A-Z]/.test(blank.answer);
    const fmt = w => (upper ? w.charAt(0).toUpperCase() + w.slice(1) : w);
    const key = s.key.toLowerCase();

    return h('section', { class: 'sheet', style: '--club:' + teeColor(club) },
      metaRow(s),
      h('p', { class: 'en-big', style: 'font-family:var(--font-body);font-weight:700' }, s.ko),
      h('p', { class: 'en-big cloze', lang: 'en' }, blank.before,
        Q.correct ? h('mark', {}, blank.answer) : h('span', { class: 'gap', 'aria-label': '빈칸' }),
        blank.after),
      h('div', { class: 'options', role: 'group', 'aria-label': '보기' },
        Q.options.map(w => {
          const picked = Q.picked.has(w);
          const cls = 'opt' + (picked ? (w === key ? ' right' : ' wrong') : '');
          return h('button', {
            type: 'button', class: cls, lang: 'en', disabled: Q.correct || picked,
            onclick: () => pickOption(s, w)
          }, (picked ? (w === key ? '✓ ' : '✕ ') : '') + fmt(w));
        })),
      Q.hint || Q.correct ? h('p', { class: 'note' }, '뜻: ' + s.key + ' = ' + s.keyKo) : null,
      Q.correct ? h('p', { class: 'en', lang: 'en', style: 'filter:none' }, s.en) : null,
      h('div', { class: 'actions' },
        !Q.correct ? h('button', { type: 'button', class: 'btn', onclick: () => { Q.hint = true; renderPractice(); } }, '뜻 힌트') : null,
        Q.correct ? h('button', { type: 'button', class: 'btn', onclick: () => playSentence(s) }, '다시 듣기') : null,
        Q.correct ? h('button', { type: 'button', class: 'btn primary', onclick: nextSentence }, '다음 문장') : null),
      session.tries ? h('p', { class: 'stat' }, '이번에 첫 번에 맞힌 문제 ' + session.ok + ' / ' + session.tries) : null);
  }

  /* 3-3. 쓰기 */
  function checkWrite(s) {
    if (!Q.answer.trim()) { toast('영어 문장을 입력해 주세요.'); return; }
    Q.result = L.scoreAnswer(s.en, Q.answer);
    recordScore(s, Q.result.score);
    renderPractice();
    playSentence(s);
  }

  function writeCard(s) {
    const club = clubOf(s.club);
    const ta = h('textarea', {
      class: 'answer', rows: '3', lang: 'en', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false',
      'aria-label': '영어로 쓰기', placeholder: '영어로 써 보세요'
    }, Q.answer);
    ta.addEventListener('input', () => { Q.answer = ta.value; });

    return h('section', { class: 'sheet', style: '--club:' + teeColor(club) },
      metaRow(s),
      h('p', { class: 'en-big', style: 'font-family:var(--font-body);font-weight:700' }, s.ko),
      ta,
      Q.hint ? h('p', { class: 'initials', lang: 'en' }, L.initialsHint(s.en)) : null,
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'btn primary', onclick: () => checkWrite(s) }, '확인'),
        h('button', { type: 'button', class: 'btn', onclick: () => { Q.hint = true; renderPractice(); } }, '첫 글자 힌트'),
        h('button', { type: 'button', class: 'btn', onclick: () => playSentence(s) }, '소리 힌트'),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { Q.reveal = true; renderPractice(); } }, '정답 보기')),
      Q.reveal && !Q.result ? h('p', { class: 'en', lang: 'en', style: 'filter:none' }, s.en) : null,
      Q.result ? resultBlock(Q.result) : null,
      Q.result ? h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'btn', onclick: () => playSentence(s) }, '다시 듣기'),
        h('button', { type: 'button', class: 'btn primary', onclick: nextSentence }, '다음 문장')) : null,
      statLine(s));
  }

  function renderPractice() {
    const root = $('#view-practice');
    root.replaceChildren();
    if (!ui.pid || !byId[ui.pid]) ui.pid = todaySentence().id;
    const s = byId[ui.pid];

    const scopeChip = (id, label, club) => h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(ui.scope === id), onclick: () => setScope(id)
    }, club ? h('i', { class: 'dot', style: '--club:' + teeColor(club) }) : null, label);

    const modes = [['speak', '따라 말하기'], ['blank', '빈칸 채우기'], ['write', '쓰기']];
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': '연습 방식' },
      modes.map(([id, label]) => h('button', {
        type: 'button', 'aria-pressed': String(ui.mode === id),
        onclick: () => { if (ui.mode !== id) { stopAll(); ui.mode = id; Q = freshQ(); renderPractice(); } }
      }, label)));

    const card = ({ speak: speakCard, blank: blankCard, write: writeCard })[ui.mode](s);
    const canNext = pool().length > 1;

    root.append(
      h('div', { class: 'chips', role: 'group', 'aria-label': '연습할 문장 범위' },
        scopeChip('today', '오늘 문장'), scopeChip('all', '전체'), CLUBS.map(c => scopeChip(c.id, c.ko, c))),
      seg,
      card,
      // append 에 null 을 넘기면 "null" 글자가 찍혀서, 없을 때는 빈 배열을 펼쳐요
      ...(ui.mode === 'speak' && canNext
        ? [h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn primary', onclick: nextSentence }, '다음 문장'))]
        : []));
  }

  /* ───────── 4. 소리와 설정 ───────── */
  function renderSound() {
    const root = $('#view-sound');
    root.replaceChildren();
    refreshVoices();

    const sample = S[2];
    const rateVal = h('span', { class: 'val' }, state.rate.toFixed(2));
    const pitchVal = h('span', { class: 'val' }, state.pitch.toFixed(2));

    const rate = h('input', { type: 'range', id: 'rate', min: '0.6', max: '1.3', step: '0.02', value: String(state.rate) });
    rate.addEventListener('input', () => { state.rate = +rate.value; rateVal.textContent = state.rate.toFixed(2); });
    rate.addEventListener('change', saveState);
    const pitch = h('input', { type: 'range', id: 'pitch', min: '0.5', max: '1.3', step: '0.05', value: String(state.pitch) });
    pitch.addEventListener('input', () => { state.pitch = +pitch.value; pitchVal.textContent = state.pitch.toFixed(2); });
    pitch.addEventListener('change', saveState);

    const select = h('select', { id: 'voice' },
      voices.map((x, i) => h('option', { value: x.v.voiceURI, selected: activeVoice && x.v.voiceURI === activeVoice.voiceURI },
        x.v.name + ' (' + x.v.lang + ')' + (i === 0 ? ' 추천' : ''))));
    select.addEventListener('change', () => {
      state.voiceURI = select.value;
      saveState();
      refreshVoices();
      playSentence(sample);
    });

    const date = h('input', { type: 'date', id: 'start', value: state.startDate, max: L.todayStr() });
    date.addEventListener('change', () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date.value) || L.dayNumberOf(date.value) < 1) { date.value = state.startDate; return; }
      state.startDate = date.value;
      ui.viewDay = null;
      saveState();
      toast('시작일을 ' + state.startDate + '로 바꿨어요. 오늘은 ' + Math.min(currentDay(), D.PLAN_DAYS) + '일차예요.');
    });

    const hideCheck = h('input', { type: 'checkbox', id: 'hide', checked: state.hideEn });
    hideCheck.addEventListener('change', () => { state.hideEn = hideCheck.checked; saveState(); document.body.dataset.hideEn = state.hideEn ? '1' : '0'; });

    root.append(
      h('section', { class: 'group' },
        h('h2', {}, '영어 목소리'),
        voices.length
          ? h('div', { class: 'field' }, h('label', { for: 'voice' }, '목소리'), select)
          : h('p', { class: 'note' }, synth ? '이 기기에서 쓸 수 있는 영어 목소리를 찾지 못했어요. 잠시 뒤 다시 열어 보거나 기기의 음성(TTS) 설정에서 영어 음성을 설치해 주세요.' : '이 브라우저는 영어 음성을 지원하지 않아요.'),
        h('div', { class: 'field' }, h('div', { class: 'lab' }, h('label', { for: 'rate' }, '말하기 속도'), rateVal), rate),
        h('div', { class: 'field' }, h('div', { class: 'lab' }, h('label', { for: 'pitch' }, '목소리 높낮이'), pitchVal), pitch),
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => playSentence(sample) }, '시험 재생'),
          h('button', { type: 'button', class: 'btn', onclick: () => { state.voiceURI = ''; state.rate = 0.92; state.pitch = 0.85; saveState(); renderSound(); } }, '추천 설정으로 되돌리기')),
        h('p', { class: 'note' }, '목소리는 기기에 들어 있는 음성으로 재생돼요. Windows와 Edge에서는 Microsoft Davis나 Guy, 아이폰과 맥에서는 Evan이나 Alex 같은 미국 남성 음성이 잘 어울려요. 높낮이를 낮추면 더 묵직하게 들려요.')),
      h('section', { class: 'group' },
        h('h2', {}, '80일 코스'),
        h('div', { class: 'field' }, h('label', { for: 'start' }, '시작일'), date),
        h('p', { class: 'note' }, '문장 순서는 누구에게나 같아요. 함께 공부하는 사람과 같은 날 시작하려면 시작일을 똑같이 맞춰 주세요. 학습 기록은 각자의 기기에만 저장돼요.'),
        h('label', { class: 'check' }, hideCheck, '영어 문장을 기본으로 가리기 (눌러서 확인)'),
        h('button', {
          type: 'button', class: 'btn danger',
          onclick: () => {
            if (!window.confirm('완료 표시와 연습 기록을 모두 지울까요?')) return;
            state.done = {}; state.stats = {}; saveState(); toast('기록을 지웠어요.');
          }
        }, '학습 기록 지우기')));
  }

  /* ───────── 화면 전환 ───────── */
  function render() {
    stopAll();
    document.body.dataset.hideEn = state.hideEn ? '1' : '0';
    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== ui.view; });
    document.querySelectorAll('.tab').forEach(b => {
      if (b.dataset.view === ui.view) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    ({ today: renderToday, clubs: renderClubs, practice: renderPractice, sound: renderSound })[ui.view]();
  }

  function go(view, patch) {
    if (patch) { Object.assign(ui, patch); if (view === 'practice') Q = freshQ(); }
    ui.view = view;
    try { history.replaceState(null, '', '#' + view); } catch (e) { /* 무시 */ }
    render();
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));

  // 날짜가 바뀐 뒤 앱으로 돌아오면 새 날짜로 갱신
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const now = L.todayStr();
    if (now !== ui.stamp) { ui.stamp = now; ui.viewDay = null; if (ui.view === 'today') render(); }
  });

  /* ───────── 시작 ───────── */
  if (synth) {
    refreshVoices();
    const onVoices = () => { refreshVoices(); if (ui.view === 'sound') renderSound(); };
    if (synth.addEventListener) synth.addEventListener('voiceschanged', onVoices);
    else synth.onvoiceschanged = onVoices;
  }

  const first = location.hash.replace('#', '');
  ui.view = VIEWS.indexOf(first) >= 0 ? first : 'today';
  render();
})();
