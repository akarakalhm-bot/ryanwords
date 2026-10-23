// 호민쌤단어장 service worker: 온라인이면 항상 최신, 오프라인이면 마지막으로 받은 자료를 사용
const CACHE = "ryanwords-v1";
const CORE = ["./", "./index.html", "./manifest.json", "./manifest.webmanifest", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;           // 글꼴 등 외부 자원은 브라우저 기본 처리
  const key = url.origin + url.pathname;               // ?v= 같은 쿼리는 무시하고 저장
  e.respondWith(
    fetch(req).then(res => {
      if(res && res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key).then(hit => hit || (url.pathname.endsWith("/") || url.pathname.endsWith("index.html") ? caches.match("./index.html") : undefined)))
  );
});
