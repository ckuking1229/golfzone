/* 골프 레슨 영어: 오프라인 저장 (화면 파일 + 영어 음성)
   - 화면 파일은 인터넷이 되면 항상 새것을 받고, 안 되면 저장해 둔 것을 써요.
   - 음성 파일(audio/*.mp3)은 한 번 받으면 저장해 두고 그다음부터는 인터넷 없이 재생해요.
   아이폰 Safari는 음성 파일을 부분(Range)으로 요청하기 때문에 저장본에서도 부분 응답(206)을 만들어 줘요. */
const SHELL_CACHE = 'golf-shell-v3';
const AUDIO_CACHE = 'golf-audio-v1';
const SHELL_FILES = ['./', 'index.html', 'styles.css', 'sentences.js', 'logic.js', 'app.js',
  'favicon.svg', 'manifest.webmanifest', 'icon-192.png', 'apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, AUDIO_CACHE];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

function rangeOf(res, header) {
  return res.arrayBuffer().then(buf => {
    const total = buf.byteLength;
    const m = /^bytes=(\d*)-(\d*)$/.exec(String(header).trim());
    if (!m || (m[1] === '' && m[2] === '')) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + total } });
    let start, end;
    if (m[1] === '') { start = Math.max(0, total - Number(m[2])); end = total - 1; }
    else { start = Number(m[1]); end = m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1); }
    if (start > end || start >= total) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + total } });
    return new Response(buf.slice(start, end + 1), {
      status: 206, statusText: 'Partial Content',
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Content-Length': String(end - start + 1)
      }
    });
  });
}

async function audioResponse(request) {
  const cache = await caches.open(AUDIO_CACHE);
  let res = await cache.match(request.url);
  if (!res) {
    const net = await fetch(request.url);          // 부분 요청이어도 파일 전체를 받아 저장해요 (한 개에 10KB 안팎)
    if (!net.ok) return net;
    await cache.put(request.url, net.clone());
    res = net;
  }
  const range = request.headers.get('range');
  return range ? rangeOf(res, range) : res;
}

async function shellResponse(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const net = await fetch(request);
    if (net.ok && net.type === 'basic') cache.put(request, net.clone());
    return net;
  } catch (err) {
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    if (request.mode === 'navigate') {
      const page = await cache.match('index.html');
      if (page) return page;
    }
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/audio/') !== -1) {
    event.respondWith(audioResponse(req).catch(() => fetch(req)));
  } else {
    event.respondWith(shellResponse(req));
  }
});

// 앱이 보낸 목록의 음성 파일을 미리 저장해 둬요 (골프장처럼 신호가 약한 곳에서도 쓰려고)
self.addEventListener('message', event => {
  const data = event.data;
  if (!data || data.type !== 'precache-audio' || !Array.isArray(data.urls)) return;
  event.waitUntil((async () => {
    const cache = await caches.open(AUDIO_CACHE);
    for (const u of data.urls) {
      const abs = new URL(u, self.location.href).href;
      if (await cache.match(abs)) continue;
      try {
        const r = await fetch(abs);
        if (r.ok) await cache.put(abs, r);
      } catch (err) { /* 연결이 끊기면 다음에 다시 시도해요 */ }
    }
  })());
});
