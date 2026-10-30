/*
 * 화면과 무관한 순수 로직: 날짜 계산, 80일 계획, 채점, 빈칸 문제 만들기
 * (브라우저에서는 window.GolfLogic, Node에서는 require 로 쓸 수 있어요)
 */
(function (root) {
  'use strict';

  /* ---------- 날짜 ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }

  function todayStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // 시작일을 1일차로 세어 오늘이 며칠째인지 돌려줘요. (UTC로 계산해서 서머타임에 흔들리지 않아요)
  function dayNumberOf(startStr, now) {
    now = now || new Date();
    var p = String(startStr).split('-').map(Number);
    var start = Date.UTC(p[0], p[1] - 1, p[2]);
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((today - start) / 86400000) + 1;
  }

  // 오늘(또는 오늘 전날)부터 거꾸로 이어진 완료 일수
  function streakOf(done, today) {
    var d = done[today] ? today : today - 1;
    var n = 0;
    while (d >= 1 && done[d]) { n++; d--; }
    return n;
  }

  /* ---------- 고정 시드 난수 (같은 시드면 누구에게나 같은 순서) ---------- */
  function xmur3(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rand) {
    rand = rand || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /*
   * 80일 계획: 문장 전체를 한 바퀴(라운드)씩 섞어서 이어 붙여요.
   * 20문장이면 4바퀴 → 모든 문장이 정확히 4번씩 나오고, 바퀴 경계에서도 같은 문장이 연달아 나오지 않아요.
   */
  function buildPlan(ids, days, seed) {
    var rand = mulberry32(xmur3(String(seed))());
    var plan = [];
    while (plan.length < days) {
      var round = shuffle(ids, rand);
      if (plan.length && round.length > 1 && round[0] === plan[plan.length - 1]) {
        var t = round[0]; round[0] = round[1]; round[1] = t;
      }
      plan = plan.concat(round);
    }
    return plan.slice(0, days);
  }

  /* ---------- 채점 ---------- */
  function norm(str) {
    return String(str == null ? '' : str).toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/\bdo not\b/g, "don't")
      .replace(/[-–—]/g, ' ')
      .replace(/[^a-z0-9'\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(str) {
    var n = norm(str);
    return n ? n.split(' ') : [];
  }

  // a 쪽 단어 중 b 와 순서대로 일치하는 단어에 true 를 달아줘요 (최장 공통 부분수열)
  function lcsMarks(a, b) {
    var n = a.length, m = b.length, i, j;
    var dp = [];
    for (i = 0; i <= n; i++) dp.push(new Array(m + 1).fill(0));
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var marks = new Array(n).fill(false);
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { marks[i] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return { marks: marks, length: dp[0][0] };
  }

  // target(정답 문장)과 spoken(말하거나 쓴 문장)을 비교해 점수와 단어별 맞고 틀림을 돌려줘요
  function scoreAnswer(target, spoken) {
    var words = String(target).trim().split(/\s+/);
    var tTokens = [], owner = [];
    words.forEach(function (w, wi) {
      tokenize(w).forEach(function (t) { tTokens.push(t); owner.push(wi); });
    });
    var sTokens = tokenize(spoken);
    var res = lcsMarks(tTokens, sTokens);
    var ok = words.map(function () { return true; });
    tTokens.forEach(function (t, i) { if (!res.marks[i]) ok[owner[i]] = false; });
    var denom = Math.max(tTokens.length, sTokens.length);
    return {
      score: denom ? Math.round(100 * res.length / denom) : 0,
      words: words.map(function (w, i) { return { text: w, ok: ok[i] }; })
    };
  }

  /* ---------- 빈칸 채우기 ---------- */
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function makeBlank(en, key) {
    var m = new RegExp('\\b' + escapeRe(key) + '\\b', 'i').exec(en);
    if (!m) return null;
    return { before: en.slice(0, m.index), answer: m[0], after: en.slice(m.index + m[0].length) };
  }

  // 정답 1개 + 오답 3개 (품사가 같은 단어를 먼저 쓰고, 부족하면 다른 품사로 채워요)
  function pickOptions(sentence, all, rand) {
    var key = sentence.key.toLowerCase();
    var others = all.filter(function (x) { return x.id !== sentence.id && x.key && x.key.toLowerCase() !== key; });
    var same = shuffle(others.filter(function (x) { return x.pos === sentence.pos; }), rand);
    var rest = shuffle(others.filter(function (x) { return x.pos !== sentence.pos; }), rand);
    var picks = [];
    same.concat(rest).forEach(function (x) {
      var k = x.key.toLowerCase();
      if (picks.length < 3 && picks.indexOf(k) === -1) picks.push(k);
    });
    return shuffle([key].concat(picks), rand);
  }

  // "Take the club" -> "T__e t__ c___"
  function initialsHint(en) {
    return en.split(/\s+/).map(function (w) {
      var seen = false;
      return w.replace(/[A-Za-z]/g, function (c) { if (!seen) { seen = true; return c; } return '_'; });
    }).join(' ');
  }

  var api = {
    todayStr: todayStr, dayNumberOf: dayNumberOf, streakOf: streakOf,
    shuffle: shuffle, buildPlan: buildPlan,
    tokenize: tokenize, scoreAnswer: scoreAnswer,
    makeBlank: makeBlank, pickOptions: pickOptions, initialsHint: initialsHint
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GolfLogic = api;
})(typeof self !== 'undefined' ? self : this);
