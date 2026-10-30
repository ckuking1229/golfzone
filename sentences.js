/*
 * 레슨 문장 데이터
 * 문장을 고치거나 바꾸려면 이 파일만 수정하세요.
 *
 * 한 줄의 모양: [상황, 영어, 한국어, 빈칸 단어, 품사, 빈칸 단어의 뜻]
 *  - 영어 문장은 한 번에 한 가지 지적만, 쉼표 없이, 쉬운 단어로 짧게 썼어요
 *  - 빈칸 단어는 영어 문장 안에 그대로 들어 있어야 해요 ('빈칸 채우기' 연습에 써요)
 *  - 품사는 n(명사) v(동사) adj(형용사) adv(부사). 같은 품사끼리 보기로 묶여요
 *  - 오른손잡이 기준이에요. 앞발=front foot, 앞쪽 팔=front arm 처럼 좌우 무관한 표현을 썼어요
 *
 * 문장 id는 자동으로 <클럽>-<단계>-<번호> 로 만들어져요. 예: driver-backswing-2
 * (녹음 파일을 쓸 때 audio/driver-backswing-2.mp3 처럼 같은 이름으로 넣어요)
 */
(function (root) {
  var CLUBS = [
    { id: 'driver', ko: '드라이버', en: 'Driver', marker: 'black' },
    { id: 'wood', ko: '우드', en: 'Fairway wood', marker: 'blue' },
    { id: 'iron', ko: '아이언', en: 'Iron', marker: 'white' },
    { id: 'wedge', ko: '웨지', en: 'Wedge', marker: 'gold' },
    // 퍼터는 단계 이름이 달라요
    { id: 'putter', ko: '퍼터', en: 'Putter', marker: 'red',
      phaseKo: { backswing: '백스트로크', downswing: '포워드 스트로크' } }
  ];

  var PHASES = [
    { id: 'stance', ko: '스탠스', en: 'Stance' },
    { id: 'backswing', ko: '백스윙', en: 'Backswing' },
    { id: 'downswing', ko: '다운스윙', en: 'Downswing' },
    { id: 'finish', ko: '피니시', en: 'Finish' }
  ];

  var DATA = {
    /* ───────────── 드라이버 ───────────── */
    driver: {
      stance: [
        ['스탠스가 좁아서 불안정할 때',
          'Stand a little wider.', '조금 더 넓게 서세요.', 'wider', 'adj', '더 넓은'],
        ['스탠스가 너무 넓어 몸이 안 돌아갈 때',
          'Move your feet closer.', '발을 조금 더 모으세요.', 'closer', 'adv', '더 가까이'],
        ['공이 너무 뒤에 있을 때',
          'Move the ball forward.', '공을 앞으로 옮기세요.', 'forward', 'adv', '앞으로'],
        ['타깃보다 오른쪽을 보고 서 있을 때',
          'Aim a little left.', '조금 더 왼쪽을 겨냥하세요.', 'aim', 'v', '겨냥하다'],
        ['타깃보다 왼쪽을 보고 서 있을 때',
          'Aim a little right.', '조금 더 오른쪽을 겨냥하세요.', 'right', 'adv', '오른쪽으로']
      ],
      backswing: [
        ['백스윙이 너무 빠를 때',
          'Take it back slowly.', '천천히 올리세요.', 'slowly', 'adv', '천천히'],
        ['몸이 오른쪽으로 밀릴 때',
          "Don't slide to the right.", '오른쪽으로 밀리지 마세요.', 'slide', 'v', '밀리다, 미끄러지다'],
        ['백스윙이 너무 클 때 (오버스윙)',
          "Don't go back too far.", '너무 멀리 올리지 마세요.', 'far', 'adv', '멀리'],
        ['어깨가 충분히 돌지 않을 때',
          'Turn your shoulders more.', '어깨를 더 돌리세요.', 'shoulders', 'n', '어깨']
      ],
      downswing: [
        ['위에서 덮어 칠 때 (아웃-인)',
          'Swing from the inside.', '안쪽에서 휘두르세요.', 'inside', 'n', '안쪽'],
        ['손목이 너무 일찍 풀릴 때',
          'Keep your wrist angle.', '손목 각도를 유지하세요.', 'angle', 'n', '각도'],
        ['체중이 뒷발에 남을 때',
          'Move your weight forward.', '체중을 앞으로 옮기세요.', 'weight', 'n', '체중'],
        ['임팩트에서 몸이 일어설 때',
          "Don't stand up early.", '일찍 일어서지 마세요.', 'stand', 'v', '서다, 일어서다']
      ],
      finish: [
        ['임팩트에서 스윙이 멈출 때',
          'Swing all the way through.', '끝까지 휘두르세요.', 'through', 'adv', '끝까지, 통과해서'],
        ['피니시에서 뒤로 넘어질 때',
          "Don't fall back.", '뒤로 넘어지지 마세요.', 'fall', 'v', '넘어지다'],
        ['피니시에서 균형이 흔들릴 때',
          'Keep your balance.', '균형을 유지하세요.', 'balance', 'n', '균형']
      ]
    },

    /* ───────────── 우드 ───────────── */
    wood: {
      stance: [
        ['발밑이 불안정할 때',
          'Make your stance wider.', '스탠스를 더 넓게 만드세요.', 'stance', 'n', '스탠스(발 자세)'],
        ['체중이 한쪽으로 쏠릴 때',
          'Make your stance narrower.', '스탠스를 더 좁게 만드세요.', 'narrower', 'adj', '더 좁은'],
        ['공이 너무 가운데에 있을 때',
          'Put the ball a bit forward.', '공을 조금 더 앞에 두세요.', 'ball', 'n', '공'],
        ['발이 타깃보다 오른쪽을 향할 때',
          'Turn your feet left.', '발을 왼쪽으로 돌리세요.', 'feet', 'n', '발(두 발)'],
        ['발이 타깃보다 왼쪽을 향할 때',
          'Turn your feet right.', '발을 오른쪽으로 돌리세요.', 'turn', 'v', '돌리다']
      ],
      backswing: [
        ['클럽이 너무 빨리 올라갈 때',
          'Keep the club low.', '클럽을 낮게 유지하세요.', 'low', 'adj', '낮은'],
        ['머리가 흔들릴 때',
          'Keep your head steady.', '머리를 흔들리지 않게 하세요.', 'steady', 'adj', '흔들림 없는'],
        ['팔로만 클럽을 들 때',
          "Don't lift with your arms.", '팔로만 들지 마세요.', 'lift', 'v', '들어 올리다'],
        ['템포가 급할 때',
          "Don't rush your backswing.", '백스윙을 서두르지 마세요.', 'rush', 'v', '서두르다']
      ],
      downswing: [
        ['공을 띄우려고 퍼올릴 때',
          "Don't try to lift the ball.", '공을 띄우려 하지 마세요.', 'try', 'v', '시도하다'],
        ['뒤땅을 칠 때',
          "Don't hit the ground first.", '땅을 먼저 치지 마세요.', 'ground', 'n', '땅, 지면'],
        ['공을 깎아 칠 때 (슬라이스)',
          'Swing along the target line.', '목표선을 따라 휘두르세요.', 'line', 'n', '선'],
        ['가슴이 너무 일찍 열릴 때',
          'Keep your chest closed.', '가슴을 닫아 두세요.', 'closed', 'adj', '닫힌']
      ],
      finish: [
        ['피니시가 낮고 짧을 때',
          'Finish with your hands high.', '손을 높이 올려 피니시하세요.', 'high', 'adj', '높은'],
        ['가슴이 타깃을 향하지 않을 때',
          'Finish facing the target.', '타깃을 보며 피니시하세요.', 'target', 'n', '타깃, 목표'],
        ['체중이 뒤에 남을 때',
          'Stand on your front foot.', '앞발로 서세요.', 'front', 'adj', '앞쪽의']
      ]
    },

    /* ───────────── 아이언 ───────────── */
    iron: {
      stance: [
        ['스탠스가 좁을 때',
          'Spread your feet more.', '발을 더 벌리세요.', 'spread', 'v', '벌리다'],
        ['숏아이언에서 몸이 뻣뻣할 때',
          'Bring your feet closer.', '발을 더 가깝게 모으세요.', 'bring', 'v', '가져오다, 모으다'],
        ['공이 너무 뒤에 있을 때',
          'Put the ball in the middle.', '공을 가운데에 두세요.', 'middle', 'n', '가운데'],
        ['어깨가 타깃보다 오른쪽을 향할 때',
          'Turn your shoulders left.', '어깨를 왼쪽으로 돌리세요.', 'shoulders', 'n', '어깨'],
        ['엉덩이가 타깃보다 왼쪽을 향할 때',
          'Turn your hips right.', '엉덩이를 오른쪽으로 돌리세요.', 'hips', 'n', '엉덩이']
      ],
      backswing: [
        ['앞쪽 팔이 굽을 때',
          'Keep your front arm straight.', '앞쪽 팔을 곧게 유지하세요.', 'straight', 'adj', '곧은'],
        ['클럽을 안쪽으로 너무 빨리 뺄 때',
          'Take the club straight back.', '클럽을 곧게 뒤로 빼세요.', 'back', 'adv', '뒤로'],
        ['돌릴 때 무릎이 펴질 때',
          'Keep your knees bent.', '무릎을 굽힌 채 유지하세요.', 'bent', 'adj', '굽혀진'],
        ['타깃 쪽으로 기울 때',
          "Don't lean toward the target.", '타깃 쪽으로 기울지 마세요.', 'lean', 'v', '기울다']
      ],
      downswing: [
        ['체중이 뒤에 남을 때',
          'Put your weight on your front foot.', '체중을 앞발에 실으세요.', 'foot', 'n', '발'],
        ['디봇이 없거나 공을 얇게 칠 때',
          'Hit the ball first.', '공을 먼저 맞히세요.', 'first', 'adv', '먼저'],
        ['손목이 일찍 풀릴 때',
          'Keep your hands ahead.', '손을 앞에 두세요.', 'ahead', 'adv', '앞에'],
        ['팔만 먼저 내려올 때',
          'Turn your hips first.', '엉덩이를 먼저 돌리세요.', 'turn', 'v', '돌리다']
      ],
      finish: [
        ['피니시를 금방 풀 때',
          'Hold your finish.', '피니시를 유지하세요.', 'hold', 'v', '유지하다, 붙잡다'],
        ['팔꿈치가 접힐 때',
          "Don't bend your elbow.", '팔꿈치를 구부리지 마세요.', 'elbow', 'n', '팔꿈치'],
        ['피니시에서 몸이 구부정할 때',
          'Stand tall at the finish.', '키를 세워 피니시하세요.', 'tall', 'adj', '키가 큰, 곧게 선']
      ]
    },

    /* ───────────── 웨지 ───────────── */
    wedge: {
      stance: [
        ['풀 웨지샷이 불안정할 때',
          'Take a wider stance.', '스탠스를 더 넓게 하세요.', 'wider', 'adj', '더 넓은'],
        ['짧은 피치샷에서 몸이 굳을 때',
          'Keep your feet close together.', '발을 가깝게 모으세요.', 'close', 'adv', '가까이'],
        ['공이 낮게 날아갈 때',
          'Move the ball forward a little.', '공을 조금 앞으로 옮기세요.', 'little', 'adv', '조금'],
        ['깃대보다 오른쪽을 보고 서 있을 때',
          'Aim a bit left of the flag.', '깃대보다 조금 왼쪽을 겨냥하세요.', 'flag', 'n', '깃대'],
        ['깃대보다 왼쪽을 보고 서 있을 때',
          'Aim a bit right of the flag.', '깃대보다 조금 오른쪽을 겨냥하세요.', 'bit', 'n', '조금(a bit)']
      ],
      backswing: [
        ['백스윙이 너무 클 때',
          'Stop the club at your hip.', '클럽을 허리 높이에서 멈추세요.', 'hip', 'n', '허리, 엉덩이 옆'],
        ['손으로만 클럽을 들 때',
          "Don't use only your hands.", '손만 쓰지 마세요.', 'only', 'adv', '오직'],
        ['테이크어웨이가 급할 때',
          'Keep a smooth rhythm.', '부드러운 리듬을 유지하세요.', 'rhythm', 'n', '리듬'],
        ['체중이 뒤로 쏠릴 때',
          'Keep your weight on your front foot.', '체중을 앞발에 유지하세요.', 'front', 'adj', '앞쪽의']
      ],
      downswing: [
        ['임팩트에서 감속할 때',
          "Don't slow down at the ball.", '공 앞에서 느려지지 마세요.', 'slow', 'v', '느려지다'],
        ['공 뒤를 칠 때 (뒤땅)',
          "Don't hit behind the ball.", '공 뒤를 치지 마세요.', 'behind', 'adv', '뒤에'],
        ['손목으로 공을 퍼올릴 때',
          "Don't flip your wrists.", '손목을 뒤집지 마세요.', 'flip', 'v', '뒤집다'],
        ['거리 조절이 안 될 때',
          'Change your swing length for distance.', '거리를 위해 스윙 길이를 바꾸세요.', 'distance', 'n', '거리']
      ],
      finish: [
        ['피니시가 백스윙보다 짧을 때',
          'Match your finish to your backswing.', '피니시를 백스윙에 맞추세요.', 'match', 'v', '맞추다'],
        ['몸이 멈추고 팔만 나갈 때',
          'Keep turning your body.', '몸을 계속 돌리세요.', 'body', 'n', '몸'],
        ['고개를 너무 일찍 들 때',
          "Don't lift your head early.", '고개를 일찍 들지 마세요.', 'head', 'n', '머리']
      ]
    },

    /* ───────────── 퍼터 ───────────── */
    putter: {
      stance: [
        ['하체가 흔들릴 때',
          'Widen your stance a little.', '스탠스를 조금 넓히세요.', 'widen', 'v', '넓히다'],
        ['숏퍼트에서 자세가 불편할 때',
          'Narrow your stance a little.', '스탠스를 조금 좁히세요.', 'narrow', 'v', '좁히다'],
        ['공이 너무 뒤에 있을 때',
          'Put the ball near your front foot.', '공을 앞발 가까이에 두세요.', 'near', 'adv', '가까이'],
        ['홀보다 오른쪽을 보고 서 있을 때',
          'Aim a little left of the hole.', '홀보다 조금 왼쪽을 겨냥하세요.', 'hole', 'n', '홀(구멍)'],
        ['홀보다 왼쪽을 보고 서 있을 때',
          'Aim a little right of the hole.', '홀보다 조금 오른쪽을 겨냥하세요.', 'right', 'adv', '오른쪽으로']
      ],
      backswing: [
        ['손목이 움직일 때',
          "Don't move your wrists.", '손목을 움직이지 마세요.', 'move', 'v', '움직이다'],
        ['백스트로크가 너무 길 때',
          'Make your backstroke shorter.', '백스트로크를 더 짧게 하세요.', 'shorter', 'adj', '더 짧은'],
        ['어깨를 쓰지 않고 손으로 칠 때',
          'Rock your shoulders back and forth.', '어깨를 앞뒤로 흔들듯 움직이세요.', 'rock', 'v', '흔들다'],
        ['템포가 들쭉날쭉할 때',
          'Keep the same speed.', '같은 속도를 유지하세요.', 'speed', 'n', '속도']
      ],
      downswing: [
        ['페이스가 열리거나 닫힐 때',
          'Keep the face square.', '페이스를 스퀘어로 유지하세요.', 'square', 'adj', '스퀘어(목표선과 직각인)'],
        ['임팩트에서 퍼터가 멈출 때',
          "Don't stop at the ball.", '공에서 멈추지 마세요.', 'stop', 'v', '멈추다'],
        ['공을 때리듯 칠 때',
          'Stroke the ball smoothly.', '공을 부드럽게 굴리듯 치세요.', 'smoothly', 'adv', '부드럽게'],
        ['공이 페이스 가장자리에 맞을 때',
          'Hit the middle of the face.', '페이스 가운데로 치세요.', 'middle', 'n', '가운데']
      ],
      finish: [
        ['고개를 너무 일찍 들 때',
          'Keep your head still.', '머리를 가만히 두세요.', 'still', 'adj', '가만히 있는'],
        ['헤드가 라인에서 벗어날 때',
          'Follow through toward the target.', '타깃 쪽으로 따라 보내세요.', 'follow', 'v', '따라가다'],
        ['공이 가는 걸 끝까지 보지 않을 때',
          'Watch the ball roll.', '공이 구르는 걸 보세요.', 'roll', 'v', '구르다']
      ]
    }
  };

  // 클럽 → 단계 → 줄 순서로 펼쳐서 문장 목록을 만들어요
  var SENTENCES = [];
  CLUBS.forEach(function (club) {
    PHASES.forEach(function (phase) {
      (DATA[club.id][phase.id] || []).forEach(function (row, i) {
        SENTENCES.push({
          id: club.id + '-' + phase.id + '-' + (i + 1),
          club: club.id, phase: phase.id,
          sit: row[0], en: row[1], ko: row[2],
          key: row[3], pos: row[4], keyKo: row[5]
        });
      });
    });
  });

  var data = {
    CLUBS: CLUBS,
    PHASES: PHASES,
    SENTENCES: SENTENCES,
    PLAN_DAYS: 80,                    // '오늘의 한 문장' 코스 길이(일). 문장이 80개라 하루에 하나씩 한 번씩 나와요
    PLAN_SEED: 'golf-english-80-v2',  // 같은 값이면 누구의 폰에서나 같은 순서로 나와요
    USE_RECORDED_AUDIO: true          // audio/<id>.mp3 (느리게는 <id>-slow.mp3) 녹음 파일을 먼저 재생해요. false면 기기 음성만 써요
  };

  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.GOLF_DATA = data;
})(typeof self !== 'undefined' ? self : this);
