/*
 * 레슨 문장 데이터
 * 문장을 고치거나 바꾸려면 이 파일만 수정하세요.
 *
 * 한 줄의 모양: [상황, 영어, 한국어, 빈칸 단어, 품사, 빈칸 단어의 뜻]
 *  - 빈칸 단어는 영어 문장 안에 그대로 들어 있어야 해요 ('빈칸 채우기' 연습에 써요)
 *  - 품사는 n(명사) v(동사) adj(형용사) adv(부사). 같은 품사끼리 보기로 묶여요
 *  - 오른손잡이 기준이에요. 앞발=front foot, 앞쪽 팔=lead arm 처럼 좌우 무관한 표현을 썼어요
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
          'Widen your stance a little, so your feet are outside your shoulders.',
          '스탠스를 조금 넓혀서 발이 어깨 바깥쪽에 오게 하세요.', 'widen', 'v', '넓히다'],
        ['스탠스가 너무 넓어 몸이 안 돌아갈 때',
          'Narrow your stance a little, so your body can turn more easily.',
          '스탠스를 조금 좁혀서 몸이 더 쉽게 돌아가게 하세요.', 'narrow', 'v', '좁히다'],
        ['공이 너무 뒤에 있을 때',
          'Move the ball forward, just inside your front heel.',
          '공을 앞쪽으로 옮겨서 앞발 뒤꿈치 바로 안쪽에 두세요.', 'forward', 'adv', '앞쪽으로'],
        ['타깃보다 오른쪽을 보고 서 있을 때',
          "You're aiming too far right, so turn your feet a little to the left.",
          '목표보다 너무 오른쪽을 보고 있으니, 발을 조금 왼쪽으로 돌리세요.', 'aiming', 'v', '겨냥하다'],
        ['타깃보다 왼쪽을 보고 서 있을 때',
          "You're aiming too far left, so turn your feet a little to the right.",
          '목표보다 너무 왼쪽을 보고 있으니, 발을 조금 오른쪽으로 돌리세요.', 'turn', 'v', '돌리다']
      ],
      backswing: [
        ['백스윙이 너무 빠를 때',
          'Slow down your backswing, and let the club move back smoothly.',
          '백스윙 속도를 줄이고 클럽이 부드럽게 올라가게 하세요.', 'smoothly', 'adv', '부드럽게'],
        ['몸이 오른쪽으로 밀릴 때',
          "Don't slide your hips to the right, and turn around your spine instead.",
          '엉덩이를 오른쪽으로 밀지 말고, 대신 척추를 축으로 돌리세요.', 'slide', 'v', '밀다, 미끄러지다'],
        ['백스윙이 너무 클 때 (오버스윙)',
          'Shorten your backswing, and stop when the club is parallel to the ground.',
          '백스윙을 줄이고, 클럽이 지면과 평행할 때 멈추세요.', 'parallel', 'adj', '평행한'],
        ['어깨가 충분히 돌지 않을 때',
          'Turn your back to the target, and feel your lead shoulder under your chin.',
          '등이 타깃을 향하도록 돌리고, 앞쪽 어깨가 턱 밑에 오는 느낌을 가지세요.', 'chin', 'n', '턱']
      ],
      downswing: [
        ['위에서 덮어 칠 때 (아웃-인)',
          "Swing down from the inside, and don't come over the top.",
          '안쪽에서 내려오고, 위에서 덮어 치지 마세요.', 'inside', 'n', '안쪽'],
        ['손목이 너무 일찍 풀릴 때',
          "Keep your wrists hinged longer, and don't release the club too early.",
          '손목 각도를 더 오래 유지하고, 클럽을 너무 일찍 풀지 마세요.', 'release', 'v', '풀다, 놓다'],
        ['체중이 뒷발에 남을 때',
          'Shift your weight to your front foot before you swing through.',
          '스윙이 공을 지나가기 전에 체중을 앞발로 옮기세요.', 'shift', 'v', '옮기다'],
        ['임팩트에서 몸이 일어설 때',
          "Keep your hips back, and don't stand up as you hit the ball.",
          '엉덩이를 뒤에 유지하고, 공을 칠 때 몸을 일으키지 마세요.', 'stand', 'v', '일어서다']
      ],
      finish: [
        ['임팩트에서 스윙이 멈출 때',
          "Don't stop at impact, and swing all the way through to a full finish.",
          '임팩트에서 멈추지 말고, 끝까지 휘둘러 완전한 피니시를 하세요.', 'impact', 'n', '임팩트'],
        ['피니시에서 뒤로 넘어질 때',
          "Finish with your weight on your front foot, and don't fall back.",
          '체중을 앞발에 싣고 피니시하고, 뒤로 넘어지지 마세요.', 'fall', 'v', '넘어지다'],
        ['피니시에서 균형이 흔들릴 때',
          'Hold your finish for three seconds, and check your balance.',
          '피니시를 3초 동안 유지하면서 균형을 확인하세요.', 'balance', 'n', '균형']
      ]
    },

    /* ───────────── 우드 ───────────── */
    wood: {
      stance: [
        ['발밑이 불안정할 때',
          'Widen your stance a little, so you feel stable on the fairway.',
          '스탠스를 조금 넓혀서 페어웨이에서 안정감을 느끼세요.', 'stable', 'adj', '안정적인'],
        ['체중이 한쪽으로 쏠릴 때',
          'Narrow your stance a little, and keep your weight centered.',
          '스탠스를 조금 좁히고, 체중을 가운데에 두세요.', 'centered', 'adj', '가운데에 있는'],
        ['공이 너무 가운데에 있을 때',
          'Move the ball a little forward, just ahead of the center of your stance.',
          '공을 조금 앞으로 옮겨서 스탠스 중앙보다 약간 앞에 두세요.', 'ahead', 'adv', '앞에'],
        ['발이 타깃보다 오른쪽을 향할 때',
          'Your feet point right of the target, so rotate them slightly to the left.',
          '발이 목표보다 오른쪽을 향하고 있으니, 조금 왼쪽으로 돌리세요.', 'point', 'v', '향하다'],
        ['발이 타깃보다 왼쪽을 향할 때',
          'Your feet point left of the target, so rotate them slightly to the right.',
          '발이 목표보다 왼쪽을 향하고 있으니, 조금 오른쪽으로 돌리세요.', 'rotate', 'v', '회전시키다']
      ],
      backswing: [
        ['클럽이 너무 빨리 올라갈 때',
          'Keep the club low to the ground for the first foot of the backswing.',
          '백스윙 처음 30센티미터는 클럽을 지면 가까이 낮게 유지하세요.', 'ground', 'n', '지면'],
        ['머리가 흔들릴 때',
          "Keep your head steady, and don't let it move to the right.",
          '머리를 고정하고, 오른쪽으로 움직이지 않게 하세요.', 'steady', 'adj', '흔들림 없는'],
        ['팔로만 클럽을 들 때',
          "Turn your shoulders, and don't lift the club with just your arms.",
          '어깨를 돌리고, 팔만으로 클럽을 들어 올리지 마세요.', 'lift', 'v', '들어 올리다'],
        ['템포가 급할 때',
          'Count to two on your backswing, and keep a smooth tempo.',
          '백스윙을 둘까지 세면서 하고, 부드러운 템포를 유지하세요.', 'tempo', 'n', '템포']
      ],
      downswing: [
        ['공을 띄우려고 퍼올릴 때',
          "Sweep the ball off the turf, and don't try to lift it.",
          '잔디 위에서 공을 쓸어치고, 퍼올리려고 하지 마세요.', 'turf', 'n', '잔디'],
        ['뒤땅을 칠 때',
          "Don't hit the ground behind the ball, so keep your weight forward.",
          '공 뒤의 땅을 치지 않도록 체중을 앞쪽에 유지하세요.', 'behind', 'adv', '뒤에'],
        ['공을 깎아 칠 때 (슬라이스)',
          "Swing along the target line, and don't cut across the ball.",
          '목표선을 따라 휘두르고, 공을 가로질러 깎아 치지 마세요.', 'cut', 'v', '깎다, 자르다'],
        ['가슴이 너무 일찍 열릴 때',
          'Keep your chest closed a little longer, and let your arms catch up.',
          '가슴을 조금 더 오래 닫아 두고, 팔이 따라오게 하세요.', 'chest', 'n', '가슴']
      ],
      finish: [
        ['피니시가 낮고 짧을 때',
          'Swing through the ball and finish high, with your hands above your lead shoulder.',
          '공을 지나 높게 피니시하고, 손이 앞쪽 어깨 위로 오게 하세요.', 'high', 'adj', '높은'],
        ['가슴이 타깃을 향하지 않을 때',
          'Finish with your chest and belt buckle facing the target.',
          '가슴과 벨트 버클이 목표를 향하도록 피니시하세요.', 'buckle', 'n', '버클'],
        ['체중이 뒤에 남을 때',
          'Stay balanced on your front foot, and let your back foot rise onto its toe.',
          '앞발로 균형을 잡고, 뒷발은 발끝으로 서게 하세요.', 'toe', 'n', '발끝']
      ]
    },

    /* ───────────── 아이언 ───────────── */
    iron: {
      stance: [
        ['스탠스가 좁을 때',
          'Widen your stance a little, so your feet are shoulder-width apart.',
          '스탠스를 조금 넓혀서 발이 어깨너비가 되게 하세요.', 'apart', 'adv', '떨어져'],
        ['숏아이언에서 몸이 뻣뻣할 때',
          'Narrow your stance for short irons, so your body can turn freely.',
          '숏아이언은 스탠스를 좁혀서 몸이 자유롭게 돌아가게 하세요.', 'freely', 'adv', '자유롭게'],
        ['공이 너무 뒤에 있을 때',
          'Move the ball a little forward, to the center of your stance.',
          '공을 조금 앞으로 옮겨서 스탠스 한가운데에 두세요.', 'center', 'n', '가운데'],
        ['어깨가 타깃보다 오른쪽을 향할 때',
          'Your shoulders are aiming right, so square them to the target line.',
          '어깨가 오른쪽을 향하고 있으니, 목표선과 나란히 맞추세요.', 'shoulders', 'n', '어깨'],
        ['엉덩이가 타깃보다 왼쪽을 향할 때',
          'Your hips are aiming left, so square them to the target line.',
          '엉덩이가 왼쪽을 향하고 있으니, 목표선과 나란히 맞추세요.', 'hips', 'n', '엉덩이']
      ],
      backswing: [
        ['앞쪽 팔이 굽을 때',
          'Keep your lead arm straight, and turn your shoulders away from the target.',
          '앞쪽 팔을 곧게 유지하고, 어깨를 타깃 반대쪽으로 돌리세요.', 'straight', 'adj', '곧은'],
        ['클럽을 안쪽으로 너무 빨리 뺄 때',
          "Take the club straight back, and don't pull it inside too quickly.",
          '클럽을 곧게 뒤로 빼고, 안쪽으로 너무 빨리 끌어당기지 마세요.', 'pull', 'v', '끌어당기다'],
        ['돌릴 때 무릎이 펴질 때',
          "Keep your knees flexed, and don't let them straighten as you turn.",
          '무릎을 굽힌 채 유지하고, 돌릴 때 펴지지 않게 하세요.', 'flexed', 'adj', '굽혀진'],
        ['타깃 쪽으로 기울 때',
          "Shift your weight onto your back foot, and don't lean toward the target.",
          '체중을 뒷발로 옮기고, 타깃 쪽으로 기울지 마세요.', 'lean', 'v', '기울다']
      ],
      downswing: [
        ['체중이 뒤에 남을 때',
          'Shift your weight to your front foot, and hit down on the ball.',
          '체중을 앞발로 옮기고, 공을 내려치듯 맞히세요.', 'weight', 'n', '체중'],
        ['디봇이 없거나 공을 얇게 칠 때',
          'Strike the ball first, and then take a divot in front of it.',
          '공을 먼저 맞힌 뒤에 그 앞의 잔디를 파내세요.', 'divot', 'n', '디봇(파인 잔디)'],
        ['손목이 일찍 풀릴 때',
          'Keep the angle in your wrists, and lead with your hands into impact.',
          '손목 각도를 유지하고, 손이 앞서서 임팩트로 들어가게 하세요.', 'angle', 'n', '각도'],
        ['팔만 먼저 내려올 때',
          'Rotate your hips first, and let your arms and the club follow.',
          '엉덩이를 먼저 회전시키고, 팔과 클럽이 따라오게 하세요.', 'follow', 'v', '따라오다']
      ],
      finish: [
        ['피니시를 금방 풀 때',
          'Hold your finish until the ball lands.',
          '공이 떨어질 때까지 피니시 자세를 유지하세요.', 'lands', 'v', '(땅에) 떨어지다'],
        ['팔꿈치가 접힐 때',
          "Extend your arms toward the target, and don't fold your lead elbow.",
          '팔을 타깃 쪽으로 뻗고, 앞쪽 팔꿈치를 접지 마세요.', 'elbow', 'n', '팔꿈치'],
        ['피니시에서 몸이 구부정할 때',
          'Finish tall and balanced, with your weight fully on your front foot.',
          '키를 세워 균형 있게 피니시하고, 체중을 앞발에 완전히 실으세요.', 'tall', 'adj', '곧게 선, 키가 큰']
      ]
    },

    /* ───────────── 웨지 ───────────── */
    wedge: {
      stance: [
        ['풀 웨지샷이 불안정할 때',
          'Widen your stance a little for a full wedge shot, so you stay stable.',
          '풀 웨지샷에서는 스탠스를 조금 넓혀 안정감을 유지하세요.', 'full', 'adj', '풀(최대 크기의)'],
        ['짧은 피치샷에서 몸이 굳을 때',
          'Narrow your stance for short pitch shots, with your feet closer together.',
          '짧은 피치샷은 스탠스를 좁혀서 발을 더 가깝게 모으세요.', 'closer', 'adj', '더 가까운'],
        ['공이 낮게 날아갈 때',
          'Move the ball a little forward, so the shot flies higher.',
          '공을 조금 앞으로 옮겨서 샷이 더 높이 날게 하세요.', 'higher', 'adv', '더 높이'],
        ['깃대보다 오른쪽을 보고 서 있을 때',
          "You're aiming right of the flag, so adjust your feet slightly to the left.",
          '깃대보다 오른쪽을 보고 있으니, 발을 조금 왼쪽으로 조정하세요.', 'flag', 'n', '깃대'],
        ['깃대보다 왼쪽을 보고 서 있을 때',
          "You're aiming left of the flag, so adjust your feet slightly to the right.",
          '깃대보다 왼쪽을 보고 있으니, 발을 조금 오른쪽으로 조정하세요.', 'adjust', 'v', '조정하다']
      ],
      backswing: [
        ['백스윙이 너무 클 때',
          'For a short pitch, take the club back only to hip height.',
          '짧은 피치샷은 클럽을 허리 높이까지만 빼세요.', 'height', 'n', '높이'],
        ['손으로만 클럽을 들 때',
          "Turn your chest, and don't use only your hands to lift the club.",
          '가슴을 돌리고, 손만 써서 클럽을 들어 올리지 마세요.', 'hands', 'n', '손'],
        ['테이크어웨이가 급할 때',
          'Keep a smooth rhythm, and avoid a quick, jerky takeaway.',
          '부드러운 리듬을 유지하고, 급하고 끊기는 테이크어웨이를 피하세요.', 'rhythm', 'n', '리듬'],
        ['체중이 뒤로 쏠릴 때',
          'Keep most of your weight on your front foot throughout the backswing.',
          '백스윙 내내 체중 대부분을 앞발에 유지하세요.', 'throughout', 'adv', '내내, 처음부터 끝까지']
      ],
      downswing: [
        ['임팩트에서 감속할 때',
          "Accelerate through impact, and don't let the club slow down.",
          '임팩트 구간에서 가속하고, 클럽이 느려지지 않게 하세요.', 'accelerate', 'v', '가속하다'],
        ['공 뒤를 칠 때 (뒤땅)',
          "Don't hit behind the ball, and keep your chest slightly ahead of the club.",
          '공 뒤를 치지 말고, 가슴을 클럽보다 살짝 앞에 두세요.', 'behind', 'adv', '뒤에'],
        ['손목으로 공을 퍼올릴 때',
          "Don't flip your wrists at the ball, and let the loft lift it.",
          '공을 향해 손목을 뒤집지 말고, 로프트가 공을 띄우게 하세요.', 'loft', 'n', '로프트(클럽 면의 각도)'],
        ['거리 조절이 안 될 때',
          'Control the distance with the length of your swing, not with your speed.',
          '속도가 아니라 스윙 길이로 거리를 조절하세요.', 'distance', 'n', '거리']
      ],
      finish: [
        ['피니시가 백스윙보다 짧을 때',
          'Make your follow-through the same length as your backswing.',
          '팔로스루를 백스윙과 같은 길이로 만드세요.', 'length', 'n', '길이'],
        ['몸이 멈추고 팔만 나갈 때',
          'Keep turning through the shot, and finish with your chest facing the flag.',
          '샷이 끝날 때까지 계속 돌고, 가슴이 깃대를 향하게 피니시하세요.', 'turning', 'v', '돌다'],
        ['고개를 너무 일찍 들 때',
          'Keep looking at the spot until the ball is gone, and then lift your head.',
          '공이 사라질 때까지 그 자리를 보고, 그다음에 고개를 드세요.', 'spot', 'n', '지점, 자리']
      ]
    },

    /* ───────────── 퍼터 ───────────── */
    putter: {
      stance: [
        ['하체가 흔들릴 때',
          'Widen your stance a little, so your lower body stays quiet.',
          '스탠스를 조금 넓혀서 하체가 움직이지 않게 하세요.', 'quiet', 'adj', '조용한(움직임 없는)'],
        ['숏퍼트에서 자세가 불편할 때',
          'Narrow your stance a little for short putts, and stand comfortably.',
          '숏퍼트는 스탠스를 조금 좁히고 편안하게 서세요.', 'comfortably', 'adv', '편안하게'],
        ['공이 너무 뒤에 있을 때',
          'Move the ball a little forward, closer to the inside of your front foot.',
          '공을 조금 앞으로 옮겨서 앞발 안쪽 가까이에 두세요.', 'forward', 'adv', '앞으로'],
        ['홀보다 오른쪽을 보고 서 있을 때',
          "You're aiming right of the hole, so square your shoulders to the line.",
          '홀보다 오른쪽을 보고 있으니, 어깨를 퍼팅 라인과 나란히 맞추세요.', 'hole', 'n', '홀(구멍)'],
        ['홀보다 왼쪽을 보고 서 있을 때',
          "You're aiming left of the hole, so check that your eyes are over the line.",
          '홀보다 왼쪽을 보고 있으니, 눈이 퍼팅 라인 위에 있는지 확인하세요.', 'eyes', 'n', '눈']
      ],
      backswing: [
        ['손목이 움직일 때',
          'Take the putter back with your shoulders, and keep your wrists quiet.',
          '어깨로 퍼터를 뒤로 빼고, 손목은 가만히 두세요.', 'wrists', 'n', '손목'],
        ['백스트로크가 너무 길 때',
          "Don't take the putter back too far, because the length sets the distance.",
          '퍼터를 너무 멀리 빼지 마세요. 길이가 거리를 정해요.', 'far', 'adv', '멀리'],
        ['퍼터가 일직선으로만 움직일 때',
          'Swing the putter back on a gentle arc, and not in a straight line.',
          '퍼터를 일직선이 아니라 완만한 호를 그리며 빼세요.', 'arc', 'n', '호(곡선)'],
        ['템포가 들쭉날쭉할 때',
          'Keep a steady tempo, and make the backstroke slow and smooth.',
          '일정한 템포를 유지하고, 백스트로크를 느리고 부드럽게 하세요.', 'slow', 'adj', '느린']
      ],
      downswing: [
        ['속도가 일정하지 않을 때',
          'Stroke through the ball at a steady pace, and keep the face square.',
          '일정한 속도로 공을 통과시키고, 페이스를 스퀘어로 유지하세요.', 'square', 'adj', '스퀘어(목표선과 직각인)'],
        ['임팩트에서 퍼터가 멈출 때',
          "Accelerate gently through the ball, and don't stop the putter at impact.",
          '공을 지나며 부드럽게 가속하고, 임팩트에서 퍼터를 멈추지 마세요.', 'gently', 'adv', '부드럽게'],
        ['손목으로 공을 때릴 때',
          "Keep your wrists firm, and don't flip the putter head at the ball.",
          '손목을 단단히 유지하고, 공을 향해 퍼터 헤드를 뒤집지 마세요.', 'firm', 'adj', '단단한'],
        ['공이 페이스 가장자리에 맞을 때',
          'Strike the ball on the sweet spot, in the center of the putter face.',
          '퍼터 페이스 중앙에 있는 스위트 스폿으로 공을 치세요.', 'sweet', 'adj', '스위트(가장 효율 좋은)']
      ],
      finish: [
        ['고개를 너무 일찍 들 때',
          'Hold your finish, and keep your head still until the ball is rolling.',
          '피니시를 유지하고, 공이 굴러가기 시작할 때까지 머리를 고정하세요.', 'still', 'adj', '가만히 있는'],
        ['헤드가 라인에서 벗어날 때',
          'Let the putter head follow through toward the target, along the line.',
          '퍼터 헤드가 라인을 따라 타깃 쪽으로 나가게 하세요.', 'target', 'n', '타깃, 목표'],
        ['공이 가는 걸 끝까지 보지 않을 때',
          'Hold your finish, and watch the ball roll toward the hole.',
          '피니시를 유지하고, 공이 홀 쪽으로 굴러가는 것을 지켜보세요.', 'roll', 'v', '구르다']
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
    USE_RECORDED_AUDIO: false         // true로 바꾸고 audio/<id>.mp3 를 넣으면 녹음 파일을 먼저 재생해요
  };

  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.GOLF_DATA = data;
})(typeof self !== 'undefined' ? self : this);
