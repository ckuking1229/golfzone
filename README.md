# 골프 레슨 영어

골프 레슨에 자주 쓰는 영어 문장 20개를 **한국어 버튼을 눌러서 영어 음성으로 듣고**, 80일 동안 하루 한 문장씩 연습하는 웹앱이에요.
빌드 도구 없이 HTML, CSS, JS만으로 만들어서 GitHub에 올리고 Vercel에 연결하면 바로 열려요.

## 들어 있는 기능

| 화면 | 하는 일 |
| --- | --- |
| 오늘 | 80일 코스. 매일 한 문장이 나오고, 한국어 버튼을 누르면 영어로 읽어 줘요. 지난 날 문장도 다시 볼 수 있어요. |
| 클럽별 | 드라이버, 우드, 아이언, 웨지, 퍼터를 골라서 셋업, 백스윙, 다운스윙, 피니시 문장을 순서대로 공부해요. |
| 연습 | 따라 말하기(마이크로 점수), 빈칸 채우기, 쓰기. 범위는 오늘 문장, 전체, 클럽별로 고를 수 있어요. |
| 소리 | 영어 목소리, 속도, 높낮이 조절. 80일 코스 시작일 변경. |

- 80일 코스는 20문장을 4바퀴 섞어서 만들어요. 모든 문장이 정확히 4번씩 나오고, 같은 문장이 이틀 연속 나오지 않아요.
- 순서는 `sentences.js`의 `PLAN_SEED` 값으로 정해져요. 같은 값이면 두 사람의 폰에서 **같은 날 같은 문장**이 나와요.
- 시작일은 처음 연 날이 1일차예요. 함께 공부하는 사람과 시작일을 맞추려면 `소리` 화면에서 같은 날짜로 바꿔 주세요.
- 학습 기록(완료 표시, 점수)은 각자의 기기와 브라우저에만 저장돼요. 서로 공유되지는 않아요.

## 영어 목소리에 대해

목소리는 **기기에 설치된 음성**(브라우저의 Web Speech API)으로 재생돼요. 앱이 미국 남성 목소리를 자동으로 먼저 골라요.

- Windows의 Edge와 Chrome: Microsoft Davis, Andrew, Guy 같은 Natural 음성이 가장 자연스러워요.
- 아이폰과 맥의 Safari: Evan, Aaron, Alex 같은 남성 음성. 설정 > 손쉬운 사용 > 읽어주기 > 음성에서 고품질 버전을 내려받으면 더 좋아져요.
- 안드로이드: 기기마다 달라서 `소리` 화면에서 직접 골라 보세요.

기기마다 목소리가 조금씩 달라요. **누가 열어도 똑같은 목소리**가 필요하면 녹음 파일을 쓰면 돼요.

1. 문장별 mp3를 `audio/<문장 id>.mp3`로 저장해요. 예: `audio/driver-setup.mp3` (id 목록은 `sentences.js`)
2. `sentences.js`에서 `USE_RECORDED_AUDIO: true`로 바꿔요.

파일이 없는 문장은 자동으로 기기 음성으로 읽어요. 음성 합성 서비스(ElevenLabs, OpenAI 등)로 20개를 한 번만 만들어 넣어도 돼요.

## 내 컴퓨터에서 열어보기

폴더에서 간단한 웹서버를 켜요. (마이크 인식은 `https` 또는 `localhost`에서만 동작해서, 파일을 더블클릭해 여는 방식은 권장하지 않아요.)

```bash
python3 -m http.server 8000
# 또는
npx serve
```

브라우저에서 `http://localhost:8000`을 열어요.

## GitHub에 올리기

```bash
git init
git add .
git commit -m "골프 레슨 영어 앱"
git branch -M main
git remote add origin https://github.com/ckuking1229/golfzone.git
git push -u origin main
```

GitHub CLI를 쓰면 저장소 만들기까지 한 번에 돼요: `gh repo create golfzone --private --source=. --push`

## Vercel로 배포하기

1. [vercel.com](https://vercel.com)에 GitHub 계정으로 로그인해요.
2. `Add New` > `Project`에서 `golfzone` 저장소를 `Import`해요.
3. 설정은 그대로 두면 돼요. Framework Preset은 `Other`, Build Command와 Output Directory는 비워 둬요.
4. `Deploy`를 누르면 `https://golfzone-xxxx.vercel.app` 주소가 생겨요.

이후에는 `main`에 push할 때마다 자동으로 다시 배포돼요.

## 한 사람과 공유하기

- 가장 간단한 방법: 배포된 `vercel.app` 주소를 그 사람에게 보내요. 폰 브라우저에서 열고 `홈 화면에 추가`를 해 두면 앱처럼 쓸 수 있어요.
- 주소를 열었을 때 Vercel 로그인 화면이 뜨면 프로젝트의 `Settings` > `Deployment Protection`에서 보호 범위를 확인해 주세요.
- 문장을 같이 고치고 싶다면 GitHub 저장소 `Settings` > `Collaborators`에서 상대를 초대해요. 다만 Vercel 무료(Hobby) 플랜은 팀 협업이 제한돼서, 한 사람이 push를 맡는 방식이 가장 단순해요.

## 문장 바꾸기

`sentences.js`만 고치면 돼요.

- `en`, `ko`: 영어와 한국어 문장
- `key`, `keyKo`, `pos`: 빈칸 채우기에 쓰는 핵심 단어, 뜻, 품사 (`key`는 `en` 안에 그대로 들어 있어야 해요)
- 문장 수를 늘려도 80일 코스가 알아서 맞춰져요. (예: 40문장이면 2바퀴)

## 파일 구성

```
index.html     화면 뼈대
styles.css     디자인
sentences.js   문장 데이터와 설정 (여기만 고치면 돼요)
logic.js       날짜 계산, 80일 계획, 채점 (화면과 무관한 로직)
app.js         화면과 동작
favicon.svg    아이콘
```
