/*
 * 레슨 문장 데이터
 * 문장을 고치거나 바꾸려면 이 파일만 수정하세요.
 *
 * - key / pos / keyKo : '빈칸 채우기' 연습에 쓰는 핵심 단어 (en 문장 안에 그대로 들어 있어야 해요)
 * - phaseKo           : 단계 이름을 문장별로 바꾸고 싶을 때 (퍼터의 백스트로크 등)
 * - 오른손잡이 기준으로 쓴 문장이라 왼손 레슨 때는 front foot / lead arm 표현이 그대로 통해요
 */
(function (root) {
  var CLUBS = [
    { id: 'driver', ko: '드라이버', en: 'Driver', marker: 'black' },
    { id: 'wood', ko: '우드', en: 'Fairway wood', marker: 'blue' },
    { id: 'iron', ko: '아이언', en: 'Iron', marker: 'white' },
    { id: 'wedge', ko: '웨지', en: 'Wedge', marker: 'gold' },
    { id: 'putter', ko: '퍼터', en: 'Putter', marker: 'red' }
  ];

  var PHASES = [
    { id: 'setup', ko: '셋업', en: 'Setup' },
    { id: 'backswing', ko: '백스윙', en: 'Backswing' },
    { id: 'downswing', ko: '다운스윙', en: 'Downswing' },
    { id: 'finish', ko: '피니시', en: 'Finish' }
  ];

  var SENTENCES = [
    // ── 드라이버 ──
    { id: 'driver-setup', club: 'driver', phase: 'setup',
      en: 'Tee the ball high, and place it just inside your front heel.',
      ko: '공을 높게 티업하고, 앞발 뒤꿈치 바로 안쪽에 놓으세요.',
      key: 'heel', pos: 'n', keyKo: '뒤꿈치' },
    { id: 'driver-backswing', club: 'driver', phase: 'backswing',
      en: 'Take the club back low and slow, and turn your shoulders fully.',
      ko: '클럽을 낮고 천천히 빼면서 어깨를 끝까지 돌리세요.',
      key: 'shoulders', pos: 'n', keyKo: '어깨' },
    { id: 'driver-downswing', club: 'driver', phase: 'downswing',
      en: 'Start the downswing with your hips, and let your arms follow.',
      ko: '다운스윙은 엉덩이로 시작하고, 팔은 따라오게 하세요.',
      key: 'hips', pos: 'n', keyKo: '엉덩이(하체)' },
    { id: 'driver-finish', club: 'driver', phase: 'finish',
      en: 'Swing through to a full finish, and balance on your front foot.',
      ko: '끝까지 휘둘러 완전한 피니시를 하고, 앞발로 균형을 잡으세요.',
      key: 'balance', pos: 'v', keyKo: '균형을 잡다' },

    // ── 우드 ──
    { id: 'wood-setup', club: 'wood', phase: 'setup',
      en: 'Place the ball just forward of center, with your feet shoulder-width apart.',
      ko: '공을 중앙보다 살짝 앞에 두고, 발은 어깨너비로 벌리세요.',
      key: 'center', pos: 'n', keyKo: '중앙' },
    { id: 'wood-backswing', club: 'wood', phase: 'backswing',
      en: 'Keep your head steady and make a smooth, wide backswing.',
      ko: '머리를 고정하고 부드럽고 넓게 백스윙하세요.',
      key: 'steady', pos: 'adj', keyKo: '흔들림 없는' },
    { id: 'wood-downswing', club: 'wood', phase: 'downswing',
      en: "Sweep the ball off the turf, and don't try to lift it.",
      ko: '잔디 위에서 공을 쓸어치고, 퍼올리려고 하지 마세요.',
      key: 'turf', pos: 'n', keyKo: '잔디' },
    { id: 'wood-finish', club: 'wood', phase: 'finish',
      en: 'Finish with your chest facing the target.',
      ko: '가슴이 목표 방향을 향하도록 피니시하세요.',
      key: 'chest', pos: 'n', keyKo: '가슴' },

    // ── 아이언 ──
    { id: 'iron-setup', club: 'iron', phase: 'setup',
      en: 'Bend from your hips, flex your knees slightly, and let your arms hang.',
      ko: '엉덩이(고관절)에서 상체를 숙이고, 무릎을 살짝 굽히고, 팔은 자연스럽게 늘어뜨리세요.',
      key: 'knees', pos: 'n', keyKo: '무릎' },
    { id: 'iron-backswing', club: 'iron', phase: 'backswing',
      en: 'Rotate your shoulders, and keep your lead arm straight at the top.',
      ko: '어깨를 회전시키고, 톱에서 앞쪽 팔(왼팔)을 곧게 유지하세요.',
      key: 'straight', pos: 'adj', keyKo: '곧은' },
    { id: 'iron-downswing', club: 'iron', phase: 'downswing',
      en: 'Shift your weight to your front foot, and hit down on the ball.',
      ko: '체중을 앞발로 옮기고, 공을 내려치듯 맞히세요.',
      key: 'weight', pos: 'n', keyKo: '체중' },
    { id: 'iron-finish', club: 'iron', phase: 'finish',
      en: 'Hold your finish until the ball lands.',
      ko: '공이 떨어질 때까지 피니시 자세를 유지하세요.',
      key: 'lands', pos: 'v', keyKo: '(땅에) 떨어지다' },

    // ── 웨지 ──
    { id: 'wedge-setup', club: 'wedge', phase: 'setup',
      en: 'Open your stance a little, and put more weight on your front foot.',
      ko: '스탠스를 살짝 오픈하고, 체중을 앞발에 더 실으세요.',
      key: 'stance', pos: 'n', keyKo: '스탠스(발 자세)' },
    { id: 'wedge-backswing', club: 'wedge', phase: 'backswing',
      en: 'For a short pitch, take the club back to hip height.',
      ko: '짧은 피치샷은 클럽을 허리 높이까지만 빼세요.',
      key: 'height', pos: 'n', keyKo: '높이' },
    { id: 'wedge-downswing', club: 'wedge', phase: 'downswing',
      en: "Accelerate through impact, and don't let the club slow down.",
      ko: '임팩트 구간에서 가속하고, 클럽이 느려지지 않게 하세요.',
      key: 'accelerate', pos: 'v', keyKo: '가속하다' },
    { id: 'wedge-finish', club: 'wedge', phase: 'finish',
      en: 'Make your follow-through the same length as your backswing.',
      ko: '팔로스루를 백스윙과 같은 길이로 만드세요.',
      key: 'length', pos: 'n', keyKo: '길이' },

    // ── 퍼터 ──
    { id: 'putter-setup', club: 'putter', phase: 'setup',
      en: 'Set your eyes directly over the ball, and hold the grip lightly.',
      ko: '눈을 공 바로 위에 두고, 그립은 가볍게 잡으세요.',
      key: 'lightly', pos: 'adv', keyKo: '가볍게' },
    { id: 'putter-backswing', club: 'putter', phase: 'backswing', phaseKo: '백스트로크',
      en: 'Take the putter back smoothly with your shoulders, not your hands.',
      ko: '손이 아니라 어깨로 퍼터를 부드럽게 빼세요.',
      key: 'smoothly', pos: 'adv', keyKo: '부드럽게' },
    { id: 'putter-downswing', club: 'putter', phase: 'downswing', phaseKo: '포워드 스트로크',
      en: 'Stroke through the ball at a steady pace, and keep the face square.',
      ko: '일정한 속도로 공을 통과시키고, 페이스를 스퀘어로 유지하세요.',
      key: 'square', pos: 'adj', keyKo: '스퀘어(목표선과 직각인)' },
    { id: 'putter-finish', club: 'putter', phase: 'finish',
      en: 'Hold your finish, and keep your head still until the ball is rolling.',
      ko: '피니시를 유지하고, 공이 굴러가기 시작할 때까지 머리를 고정하세요.',
      key: 'still', pos: 'adj', keyKo: '가만히 있는' }
  ];

  var data = {
    CLUBS: CLUBS,
    PHASES: PHASES,
    SENTENCES: SENTENCES,
    PLAN_DAYS: 80,                    // 오늘의 문장 코스 길이(일)
    PLAN_SEED: 'golf-english-80',     // 같은 값이면 누구의 폰에서나 같은 순서로 나와요
    USE_RECORDED_AUDIO: false         // true로 바꾸고 audio/<id>.mp3 를 넣으면 녹음 파일을 먼저 재생해요
  };

  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.GOLF_DATA = data;
})(typeof self !== 'undefined' ? self : this);
