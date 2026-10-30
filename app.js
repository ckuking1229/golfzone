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
  // 퍼터는 백스트로크, 포워드 스트로크처럼 단계 이름이 달라요
  function phaseNameOf(clubId, phaseId) {
    const club = clubId && clubId !== 'all' ? clubOf(clubId) : null;
    if (club && club.phaseKo && club.phaseKo[phaseId]) return club.phaseKo[phaseId];
    return PHASES.find(p => p.id === phaseId).ko;
  }
  const phaseName = s => phaseNameOf(s.club, s.phase);
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
  const KEY = 'golf-english-v2';

  function loadState() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    const st = Object.assign({
      startDate: L.todayStr(), done: {}, known: {}, voiceURI: '', rate: 0.92, pitch: 0.85, hideEn: false, stats: {},
      voiceMode: 'recorded'
    }, saved);
    if (st.voiceMode !== 'device') st.voiceMode = 'recorded';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(st.startDate) || L.dayNumberOf(st.startDate) < 1) st.startDate = L.todayStr();
    st.rate = clamp(Number(st.rate) || 0.92, 0.5, 1.4);
    st.pitch = clamp(Number(st.pitch) || 0.85, 0.5, 1.5);
    ['done', 'known', 'stats'].forEach(k => { if (!st[k] || typeof st[k] !== 'object') st[k] = {}; });
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

  // 클럽별 화면이 첫 화면이에요
  const VIEWS = ['clubs', 'practice', 'today', 'sound'];
  const ui = {
    view: 'clubs',
    club: 'driver', phase: 'all',          // 클럽별 화면의 선택
    pClub: 'all', pPhase: 'all', mode: 'speak', pid: null,   // 연습 화면의 선택
    viewDay: null, stamp: L.todayStr()
  };

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
  let utterance = null;     // 브라우저가 재생 중에 지워 버리지 않도록 붙잡아 둬요
  let recognizer = null;

  // 소리 화면의 "지금 상태" 문구를 갱신하는 함수 (소리 화면이 열려 있을 때만 있어요)
  let onReport = null;
  const report = msg => { if (onReport) onReport(msg); };

  function setPlaying(btn) {
    if (playingBtn) playingBtn.classList.remove('is-playing');
    playingBtn = btn || null;
    if (btn) btn.classList.add('is-playing');
  }

  /* 소리는 두 길이 있어요.
     1) 미리 녹음한 mp3 (audio/<id>.mp3, 느리게는 <id>-slow.mp3). 모든 폰에서 같은 미국 남성 목소리가 나요.
        브라우저에 따라 소리가 안 나는 기기 음성(speechSynthesis)에 기대지 않으려고 이쪽을 먼저 써요.
     2) 기기 음성. 녹음 파일을 못 받았거나 소리 화면에서 직접 골랐을 때만 써요. */
  const player = new Audio();       // 하나를 계속 재사용해요
  player.preload = 'auto';
  player.setAttribute('playsinline', '');
  let current = null;               // 녹음 파일 재생 요청 하나 { fell, timer, fallback }

  function stopAudio() {
    playToken++;
    if (current) { clearTimeout(current.timer); current = null; }
    try { player.pause(); } catch (e) { /* 무시 */ }
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
    setPlaying(null);
  }

  player.addEventListener('playing', () => {
    if (!current) return;
    clearTimeout(current.timer);
    report('녹음 음성을 재생하고 있어요. 소리가 안 들리면 아래 순서로 확인해 보세요.');
  });
  player.addEventListener('ended', () => { if (current && !current.fell) setPlaying(null); });
  player.addEventListener('error', () => { if (current) current.fallback('missing'); });

  function speakText(text, o) {
    o = o || {};
    if (!synth) {
      report('이 브라우저는 기기 음성을 지원하지 않아요. Chrome이나 Safari에서 열어 주세요.');
      toast('이 브라우저는 영어 음성 재생을 지원하지 않아요. Chrome, Safari에서 열어 주세요.');
      return;
    }
    const wasBusy = synth.speaking || synth.pending;
    stopAudio();
    const token = playToken;
    setPlaying(o.btn);
    report('기기 음성으로 읽고 있어요.');
    const run = () => {
      if (token !== playToken) return;
      const say = useVoice => {
        const u = new SpeechSynthesisUtterance(text);
        if (useVoice && activeVoice) { u.voice = activeVoice; u.lang = activeVoice.lang; } else { u.lang = 'en-US'; }
        u.rate = clamp(state.rate * (o.slow ? 0.72 : 1), 0.4, 1.6);
        u.pitch = state.pitch;
        let started = false;
        const end = () => { if (u === utterance && token === playToken) setPlaying(null); };
        u.onstart = () => { started = true; };
        u.onend = end;
        u.onerror = end;
        utterance = u;
        if (synth.paused) synth.resume();
        synth.speak(u);
        // 일부 안드로이드 폰은 고른 음성이 조용히 멈춰요: 시작이 안 되면 기본 음성으로 한 번 더 해요
        if (useVoice && activeVoice) {
          setTimeout(() => {
            if (token !== playToken || started || u !== utterance) return;
            synth.cancel();
            say(false);
          }, 1800);
        }
      };
      say(true);
    };
    if (wasBusy) setTimeout(run, 70); else run();
  }

  function playRecorded(s, o) {
    stopAudio();
    const token = playToken;
    setPlaying(o.btn);
    const req = { fell: false, timer: 0 };
    req.fallback = why => {
      if (current !== req || req.fell || token !== playToken) return;
      req.fell = true;
      clearTimeout(req.timer);
      if (why === 'blocked') {
        report('브라우저가 소리 재생을 막았어요. 화면을 한 번 누른 뒤 다시 눌러 보세요. 지금은 기기 음성으로 대신 읽어요.');
        toast('소리가 막혔어요. 한 번 더 눌러 주세요.');
      } else {
        report('녹음 파일을 불러오지 못했어요. 인터넷 연결을 확인해 주세요. 지금은 기기 음성으로 대신 읽어요.');
      }
      current = null;
      speakText(s.en, o);
    };
    current = req;
    // 파일을 받는 데 오래 걸리면 기다리지 않고 기기 음성으로 넘어가요
    req.timer = setTimeout(() => req.fallback('slow'), 7000);
    player.src = 'audio/' + s.id + (o.slow ? '-slow' : '') + '.mp3';
    const p = player.play();            // 반드시 누른 바로 그 순간에 불러야 아이폰에서 소리가 나요
    if (p && p.catch) {
      p.catch(err => {
        if (err && err.name === 'AbortError') return;      // 바로 다른 문장을 눌러서 끊긴 경우
        req.fallback(err && err.name === 'NotAllowedError' ? 'blocked' : 'failed');
      });
    }
  }

  // 문장 재생: 녹음 파일을 먼저 쓰고, 안 되면 기기 음성으로 읽어요
  function playSentence(s, o) {
    o = o || {};
    if (D.USE_RECORDED_AUDIO && state.voiceMode !== 'device') playRecorded(s, o);
    else speakText(s.en, o);
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

  function stepsEl(n) {
    return h('span', { class: 'steps', 'aria-hidden': 'true' },
      PHASES.map((p, i) => h('i', { class: i + 1 < n ? 'on' : (i + 1 === n ? 'now' : '') })));
  }

  function metaRow(s) {
    const club = clubOf(s.club);
    const n = phaseNo(s);
    return h('div', { class: 'meta' },
      h('span', { class: 'club-tag' }, h('i', { class: 'dot', style: '--club:' + teeColor(club) }), club.ko),
      h('span', { class: 'phase' }, stepsEl(n), h('b', {}, n), phaseName(s)));
  }

  const sitTitle = s => h('p', { class: 'sit-title' }, s.sit);

  // '익혔어요' 표시: 날짜와 상관없이 내가 익힌 문장을 기억해 둬요
  function knownBtn(s, onChange) {
    const label = on => (on ? '✓ ' : '') + '익혔어요';
    const on0 = !!state.known[s.id];
    const btn = h('button', { type: 'button', class: 'btn known' + (on0 ? ' on' : ''), 'aria-pressed': String(on0) }, label(on0));
    btn.addEventListener('click', () => {
      if (state.known[s.id]) delete state.known[s.id]; else state.known[s.id] = true;
      saveState();
      const on = !!state.known[s.id];
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = label(on);
      if (onChange) onChange();
    });
    return btn;
  }

  const knownText = club => {
    const all = S.filter(s => s.club === club.id);
    return all.filter(s => state.known[s.id]).length + ' / ' + all.length + ' 익힘';
  };

  /* ───────── 1. 클럽별 (첫 화면) ───────── */
  function phaseGroup(club, phase, updateCount) {
    const rows = S.filter(s => s.club === club.id && s.phase === phase.id);
    const n = PHASES.indexOf(phase) + 1;
    return h('div', { class: 'phase-group' },
      h('div', { class: 'phase-band' },
        h('b', {}, n), h('span', { class: 'phase-name' }, phaseNameOf(club.id, phase.id)), stepsEl(n),
        h('span', { class: 'count' }, rows.length + '가지 상황')),
      rows.map(s => h('article', { class: 'sit' },
        h('h3', { class: 'sit-title' }, s.sit),
        sayButton(s, { small: true }),
        enLine(s),
        h('div', { class: 'actions' },
          slowBtn(s),
          knownBtn(s, updateCount),
          h('button', {
            type: 'button', class: 'btn ghost',
            onclick: () => go('practice', { pClub: s.club, pPhase: s.phase, pid: s.id, mode: 'speak' })
          }, '연습')))));
  }

  function renderClubs() {
    const root = $('#view-clubs');
    root.replaceChildren();
    const club = clubOf(ui.club);
    const phases = ui.phase === 'all' ? PHASES : PHASES.filter(p => p.id === ui.phase);

    const clubChip = c => h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(ui.club === c.id),
      onclick: () => { ui.club = c.id; renderClubs(); }
    }, h('i', { class: 'dot', style: '--club:' + teeColor(c) }), c.ko);
    const phaseChip = (id, label) => h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(ui.phase === id),
      onclick: () => { ui.phase = id; renderClubs(); }
    }, label);

    const countEl = h('span', { class: 'club-progress' }, knownText(club));
    const updateCount = () => { countEl.textContent = knownText(club); };

    root.append(
      h('div', { class: 'chips club-row', role: 'group', 'aria-label': '클럽 선택' }, CLUBS.map(clubChip)),
      h('div', { class: 'chips', role: 'group', 'aria-label': '스윙 단계 선택' },
        phaseChip('all', '전체 단계'), PHASES.map(p => phaseChip(p.id, phaseNameOf(club.id, p.id)))),
      h('div', { class: 'actions' }, hideBtn()),
      h('section', { class: 'card-sheet', style: '--club:' + teeColor(club) },
        h('header', { class: 'sheet-head' },
          h('i', { class: 'dot lg' }),
          h('h2', {}, club.ko),
          h('span', { class: 'en-name', lang: 'en' }, club.en),
          countEl),
        phases.map(p => phaseGroup(club, p, updateCount))));
  }

  /* ───────── 2. 연습 ───────── */
  const freshQ = () => ({ result: null, error: '', listening: false, picked: new Set(), correct: false, hint: false, options: null, answer: '', reveal: false });
  let Q = freshQ();
  const session = { ok: 0, tries: 0 };

  function pool() {
    return S.filter(s => (ui.pClub === 'all' || s.club === ui.pClub) && (ui.pPhase === 'all' || s.phase === ui.pPhase));
  }

  function nextSentence() {
    const p = pool();
    const others = p.filter(s => s.id !== ui.pid);
    const list = others.length ? others : p;
    ui.pid = list[Math.floor(Math.random() * list.length)].id;
    Q = freshQ();
    renderPractice();
  }

  function setFilter(patch) {
    stopAll();
    Object.assign(ui, patch);
    if (!pool().some(s => s.id === ui.pid)) { nextSentence(); return; }
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

  /* 2-1. 따라 말하기 */
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
      sitTitle(s),
      sayButton(s),
      enLine(s),
      h('div', { class: 'actions' }, slowBtn(s), hideBtn()),
      micBlock(s),
      Q.error ? h('p', { class: 'error', role: 'alert' }, Q.error) : null,
      Q.result ? resultBlock(Q.result) : null,
      statLine(s));
  }

  /* 2-2. 빈칸 채우기 */
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
      sitTitle(s),
      h('p', { class: 'en-big ko-line' }, s.ko),
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
      Q.correct ? h('p', { class: 'en shown', lang: 'en' }, s.en) : null,
      h('div', { class: 'actions' },
        !Q.correct ? h('button', { type: 'button', class: 'btn', onclick: () => { Q.hint = true; renderPractice(); } }, '뜻 힌트') : null,
        Q.correct ? h('button', { type: 'button', class: 'btn', onclick: () => playSentence(s) }, '다시 듣기') : null,
        Q.correct ? h('button', { type: 'button', class: 'btn primary', onclick: nextSentence }, '다음 문장') : null),
      session.tries ? h('p', { class: 'stat' }, '이번에 첫 번에 맞힌 문제 ' + session.ok + ' / ' + session.tries) : null);
  }

  /* 2-3. 쓰기 */
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
      sitTitle(s),
      h('p', { class: 'en-big ko-line' }, s.ko),
      ta,
      Q.hint ? h('p', { class: 'initials', lang: 'en' }, L.initialsHint(s.en)) : null,
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'btn primary', onclick: () => checkWrite(s) }, '확인'),
        h('button', { type: 'button', class: 'btn', onclick: () => { Q.hint = true; renderPractice(); } }, '첫 글자 힌트'),
        h('button', { type: 'button', class: 'btn', onclick: () => playSentence(s) }, '소리 힌트'),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { Q.reveal = true; renderPractice(); } }, '정답 보기')),
      Q.reveal && !Q.result ? h('p', { class: 'en shown', lang: 'en' }, s.en) : null,
      Q.result ? resultBlock(Q.result) : null,
      Q.result ? h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'btn', onclick: () => playSentence(s) }, '다시 듣기'),
        h('button', { type: 'button', class: 'btn primary', onclick: nextSentence }, '다음 문장')) : null,
      statLine(s));
  }

  function renderPractice() {
    const root = $('#view-practice');
    root.replaceChildren();
    if (!ui.pid || !byId[ui.pid] || !pool().some(s => s.id === ui.pid)) {
      const p = pool();
      ui.pid = p[Math.floor(Math.random() * p.length)].id;
      Q = freshQ();
    }
    const s = byId[ui.pid];

    const clubChip = (id, label, club) => h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(ui.pClub === id), onclick: () => setFilter({ pClub: id })
    }, club ? h('i', { class: 'dot', style: '--club:' + teeColor(club) }) : null, label);
    const phaseChip = (id, label) => h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(ui.pPhase === id), onclick: () => setFilter({ pPhase: id })
    }, label);

    const modes = [['speak', '따라 말하기'], ['blank', '빈칸 채우기'], ['write', '쓰기']];
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': '연습 방식' },
      modes.map(([id, label]) => h('button', {
        type: 'button', 'aria-pressed': String(ui.mode === id),
        onclick: () => { if (ui.mode !== id) { stopAll(); ui.mode = id; Q = freshQ(); renderPractice(); } }
      }, label)));

    const card = ({ speak: speakCard, blank: blankCard, write: writeCard })[ui.mode](s);
    const canNext = pool().length > 1;

    root.append(
      h('div', { class: 'chips', role: 'group', 'aria-label': '연습할 클럽' },
        clubChip('all', '전체 클럽'), CLUBS.map(c => clubChip(c.id, c.ko, c))),
      h('div', { class: 'chips', role: 'group', 'aria-label': '연습할 스윙 단계' },
        phaseChip('all', '전체 단계'), PHASES.map(p => phaseChip(p.id, phaseNameOf(ui.pClub, p.id)))),
      seg,
      card,
      // append 에 null 을 넘기면 "null" 글자가 찍혀서, 없을 때는 빈 배열을 펼쳐요
      ...(ui.mode === 'speak' && canNext
        ? [h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn primary', onclick: nextSentence }, '다음 문장'))]
        : []));
  }

  /* ───────── 3. 오늘의 한 문장 (80일, 날짜 제한 없이 아무 날이나 열 수 있어요) ───────── */
  function progressGrid(dn, viewDay) {
    const cells = [];
    for (let d = 1; d <= D.PLAN_DAYS; d++) {
      const cls = ['cell'];
      if (state.done[d]) cls.push('done');
      if (d === dn) cls.push('today');
      if (d === viewDay) cls.push('view');
      cells.push(h('button', {
        type: 'button', class: cls.join(' '),
        'aria-label': d + '일차' + (d === dn ? ' (오늘)' : '') + (state.done[d] ? ' 완료' : ''),
        'aria-current': d === viewDay ? 'true' : null,
        onclick: () => { ui.viewDay = d; renderToday(); }
      }));
    }
    return h('div', { class: 'grid80', role: 'group', 'aria-label': D.PLAN_DAYS + '일 진행표' }, cells);
  }

  function restartCourse() {
    if (!window.confirm('오늘을 1일차로 해서 처음부터 다시 시작할까요? 일차별 완료 표시는 지워져요.')) return;
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
    const todayCell = Math.min(dn, total);
    const view = clamp(ui.viewDay == null ? todayCell : ui.viewDay, 1, total);
    ui.viewDay = view;
    const s = byId[plan[view - 1]];
    const club = clubOf(s.club);
    const doneCount = Object.keys(state.done).filter(k => state.done[k] && +k >= 1 && +k <= total).length;
    const streak = L.streakOf(state.done, todayCell);

    if (!synth) {
      root.append(h('div', { class: 'banner warn' }, h('p', {}, '이 브라우저는 영어 음성을 지원하지 않아요. Chrome, Edge, Safari로 열어 주세요.')));
    }
    if (dn > total) {
      root.append(h('div', { class: 'banner' },
        h('p', {}, total + '일 코스를 마쳤어요. ' + doneCount + '일을 학습했어요.'),
        h('button', { type: 'button', class: 'btn primary', onclick: restartCourse }, '오늘부터 다시 시작')));
    }

    const label = view === dn ? '오늘의 문장'
      : (dn > total && view === total ? '마지막 날 문장'
        : (view < dn ? (dn - view) + '일 전 문장' : (view - dn) + '일 뒤 문장'));

    root.append(
      h('div', { class: 'daybar' },
        h('div', { class: 'daycount' },
          h('span', { class: 'daynum' }, view),
          h('span', { class: 'daytotal' }, '/ ' + total + '일'),
          h('span', { class: 'daylabel' }, label)),
        h('div', { class: 'daynav' },
          h('button', { type: 'button', class: 'iconbtn', 'aria-label': '이전 날', disabled: view <= 1, onclick: () => { ui.viewDay = view - 1; renderToday(); } }, '‹'),
          h('button', { type: 'button', class: 'iconbtn', 'aria-label': '다음 날', disabled: view >= total, onclick: () => { ui.viewDay = view + 1; renderToday(); } }, '›'))),
      progressGrid(dn, view),
      h('p', { class: 'hint' }, '날짜와 상관없이 아무 날이나 눌러서 공부할 수 있어요.'),
      h('div', { class: 'tally-row' },
        h('p', { class: 'tally' },
          h('span', {}, h('b', {}, doneCount), '일 완료'),
          streak > 1 ? h('span', {}, h('b', {}, streak), '일 연속') : null),
        view !== todayCell ? h('button', { type: 'button', class: 'btn ghost', onclick: () => { ui.viewDay = todayCell; renderToday(); } }, '오늘로') : null),
      h('section', { class: 'sheet', style: '--club:' + teeColor(club) },
        metaRow(s),
        sitTitle(s),
        sayButton(s),
        enLine(s),
        h('div', { class: 'actions' },
          slowBtn(s),
          hideBtn(),
          h('button', {
            type: 'button', class: 'btn',
            onclick: () => go('practice', { pClub: 'all', pPhase: 'all', pid: s.id, mode: 'speak' })
          }, '따라 말하기'),
          h('button', {
            type: 'button', class: 'btn ghost',
            onclick: () => go('clubs', { club: s.club, phase: s.phase })
          }, '같은 상황 더 보기')),
        h('button', {
          type: 'button', class: 'btn done' + (state.done[view] ? ' on' : ''),
          'aria-pressed': String(!!state.done[view]),
          onclick: () => { state.done[view] = !state.done[view]; saveState(); renderToday(); }
        }, (state.done[view] ? '✓ ' : '') + (view === dn ? '오늘 학습 완료' : view + '일차 학습 완료'))));
  }

  /* ───────── 4. 소리와 설정 ───────── */
  function cachedAudioCount() {
    if (!('caches' in window)) return Promise.resolve(-1);
    // sw.js 의 AUDIO_CACHE 이름 끝 숫자를 올려도 세어지도록 golf-audio- 로 시작하는 저장소를 모두 봐요
    return caches.keys()
      .then(names => Promise.all(names.filter(n => n.indexOf('golf-audio-') === 0)
        .map(n => caches.open(n).then(c => c.keys()).then(k => k.length))))
      .then(counts => counts.length ? Math.max.apply(null, counts) : 0)
      .catch(() => -1);
  }

  function renderSound() {
    const root = $('#view-sound');
    root.replaceChildren();
    refreshVoices();

    const sample = byId['driver-downswing-3'] || S[0];
    const device = state.voiceMode === 'device';
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

    const mode = h('select', { id: 'voicemode' },
      h('option', { value: 'recorded', selected: !device }, '녹음 음성 (추천)'),
      h('option', { value: 'device', selected: device }, '기기 음성'));
    mode.addEventListener('change', () => { state.voiceMode = mode.value; saveState(); renderSound(); });

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

    const status = h('p', { class: 'status', id: 'sound-status', role: 'status', 'aria-live': 'polite' },
      '버튼을 누르면 예시 문장이 재생돼요.');
    onReport = msg => { status.textContent = msg; };

    const offline = h('p', { class: 'note', id: 'offline-note' }, '');
    // 저장이 끝날 때까지 몇 초마다 다시 세어서 보여줘요
    const refreshOffline = tries => cachedAudioCount().then(n => {
      if (n < 0) { offline.textContent = '이 브라우저에서는 인터넷 없이 듣기를 쓸 수 없어요.'; return; }
      const got = Math.min(n, S.length);
      offline.textContent = got >= S.length
        ? '인터넷 없이도 들을 수 있게 음성 ' + S.length + '개를 이 폰에 저장해 뒀어요.'
        : '인터넷 없이 듣도록 음성을 저장하는 중이에요. (' + got + '/' + S.length + ') 인터넷이 되는 곳에서 앱을 열어 두면 채워져요.';
      if (got < S.length && tries > 0 && offline.isConnected) setTimeout(() => refreshOffline(tries - 1), 1500);
    });
    refreshOffline(20);

    root.append(
      h('section', { class: 'group' },
        h('h2', {}, '소리 확인'),
        h('p', { class: 'note' }, '폰에서 소리가 안 나면 여기서 확인해 보세요.'),
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'btn primary', id: 'sound-test', onclick: e => playSentence(sample, { btn: e.currentTarget }) }, '소리 들어보기')),
        status,
        h('ol', { class: 'checklist' },
          h('li', {}, '폰의 미디어 볼륨을 올려 주세요. (소리 크기 버튼을 누르고 미디어 볼륨을 확인해요)'),
          h('li', {}, '아이폰은 옆면 무음 스위치를 확인해 주세요. 주황색이 보이면 무음이에요.'),
          h('li', {}, '카카오톡, 네이버 같은 앱 안에서 열었다면 오른쪽 위 메뉴에서 다른 브라우저(Safari, Chrome)로 열어 주세요.'),
          h('li', {}, '블루투스 이어폰이나 스피커가 연결돼 있으면 거기서 소리가 날 수 있어요.')),
        offline),
      h('section', { class: 'group' },
        h('h2', {}, '영어 목소리'),
        h('div', { class: 'field' }, h('label', { for: 'voicemode' }, '재생 방식'), mode),
        device ? [
          voices.length
            ? h('div', { class: 'field' }, h('label', { for: 'voice' }, '목소리'), select)
            : h('p', { class: 'note' }, synth ? '이 기기에서 쓸 수 있는 영어 목소리를 찾지 못했어요. 잠시 뒤 다시 열어 보거나 기기의 음성(TTS) 설정에서 영어 음성을 설치해 주세요.' : '이 브라우저는 기기 음성을 지원하지 않아요.'),
          h('div', { class: 'field' }, h('div', { class: 'lab' }, h('label', { for: 'rate' }, '말하기 속도'), rateVal), rate),
          h('div', { class: 'field' }, h('div', { class: 'lab' }, h('label', { for: 'pitch' }, '목소리 높낮이'), pitchVal), pitch),
          h('p', { class: 'note' }, '기기 음성은 폰마다 목소리가 달라요. Windows와 Edge에서는 Microsoft Davis나 Guy, 아이폰과 맥에서는 Evan이나 Alex 같은 미국 남성 음성이 잘 어울려요. 높낮이를 낮추면 더 묵직하게 들려요.')
        ] : h('p', { class: 'note' }, '미리 녹음한 미국 남성 목소리예요. 문장마다 보통 속도와 느린 속도 파일이 있어서, 어떤 폰으로 열어도 똑같이 들려요. 파일을 받지 못하면 폰의 기기 음성으로 대신 읽어요.'),
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'btn', onclick: () => { state.voiceURI = ''; state.rate = 0.92; state.pitch = 0.85; state.voiceMode = 'recorded'; saveState(); renderSound(); } }, '추천 설정으로 되돌리기'))),
      h('section', { class: 'group' },
        h('h2', {}, '오늘의 한 문장 (80일)'),
        h('div', { class: 'field' }, h('label', { for: 'start' }, '시작일'), date),
        h('p', { class: 'note' }, '80일 동안 하루에 한 문장씩, 80문장이 한 번씩 나와요. 날짜와 상관없이 어느 날이든 열어서 공부할 수 있어요. 문장 순서는 누구에게나 같으니, 함께 공부하는 사람과 시작일을 맞춰 두면 같은 날 같은 문장을 보게 돼요. 학습 기록은 각자의 기기에만 저장돼요.'),
        h('label', { class: 'check' }, hideCheck, '영어 문장을 기본으로 가리기 (눌러서 확인)'),
        h('button', {
          type: 'button', class: 'btn danger',
          onclick: () => {
            if (!window.confirm('익힘 표시, 완료 표시, 연습 기록을 모두 지울까요?')) return;
            state.done = {}; state.known = {}; state.stats = {}; saveState(); toast('기록을 지웠어요.');
          }
        }, '학습 기록 지우기')));
  }

  /* ───────── 화면 전환 ───────── */
  function render() {
    stopAll();
    onReport = null;
    document.body.dataset.hideEn = state.hideEn ? '1' : '0';
    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== ui.view; });
    document.querySelectorAll('.tab').forEach(b => {
      if (b.dataset.view === ui.view) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    ({ clubs: renderClubs, practice: renderPractice, today: renderToday, sound: renderSound })[ui.view]();
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

  /* 카카오톡, 네이버, 인스타그램 같은 앱 안의 브라우저에서는 마이크가 막히고 기기 음성이 안 나는 일이 많아요 */
  const IN_APP = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|FB_IAB|Line\/|DaumApps|Twitter|; wv\)/i.test(navigator.userAgent || '');
  function showAppNotice() {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('golf-notice-off') === '1'; } catch (e) { /* 무시 */ }
    if (!IN_APP || dismissed) return;
    const box = h('div', { class: 'banner warn', role: 'note', id: 'app-notice' },
      h('p', {}, '지금 다른 앱 안에서 열었어요. 영어 듣기는 되지만 마이크 연습은 안 될 수 있어요. 오른쪽 위 메뉴에서 ',
        h('b', {}, '다른 브라우저로 열기'), '를 눌러 Chrome이나 Safari에서 열어 주세요.'),
      h('button', {
        type: 'button', class: 'btn ghost',
        onclick: () => { try { sessionStorage.setItem('golf-notice-off', '1'); } catch (e) { /* 무시 */ } box.remove(); }
      }, '닫기'));
    $('#app').before(box);
  }

  /* 한 번 열어 두면 음성 파일을 폰에 저장해서, 골프장처럼 신호가 약한 곳에서도 들려요 */
  function setupOffline() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(reg => {
        const c = navigator.connection;
        if (c && c.saveData) return;
        const urls = S.map(s => 'audio/' + s.id + '.mp3');
        if (reg.active) reg.active.postMessage({ type: 'precache-audio', urls });
      }).catch(() => { /* 저장 기능이 없어도 앱은 그대로 써요 */ });
    });
  }

  const first = location.hash.replace('#', '');
  ui.view = VIEWS.indexOf(first) >= 0 ? first : 'clubs';
  render();
  showAppNotice();
  setupOffline();
})();
