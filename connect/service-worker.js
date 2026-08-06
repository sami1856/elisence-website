/* ELISENCE Connect service worker — caches app shell only; never caches API. */
var CACHE_NAME = "elisence-connect-shell-v1";
var SCOPE_PATH = "/connect/";

var PRECACHE = [
  "/connect/",
  "/connect/index.html",
  "/connect/styles.css",
  "/connect/app.js",
  "/connect/manifest.webmanifest",
  "/connect/vendor/qrcode.min.js",
  "/connect/icons/favicon.ico",
  "/connect/icons/apple-touch-icon.png",
  "/connect/icons/icon-192.png",
  "/connect/icons/icon-512.png",
  "/connect/icons/maskable-512.png"
];

function isApiRequest(url) {
  return (
    url.hostname === "api.elisence.com" ||
    url.pathname.indexOf("/v8/") === 0 ||
    url.pathname.indexOf("/api/") === 0
  );
}

function isConnectAsset(url) {
  return url.origin === self.location.origin && url.pathname.indexOf(SCOPE_PATH) === 0;
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(PRECACHE);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return undefined;
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") {
    return;
  }

  var url = new URL(request.url);

  if (isApiRequest(url)) {
    return;
  }

  if (!isConnectAsset(url)) {
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then(function (response) {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          var contentType = response.headers.get("content-type") || "";
          var cacheable =
            contentType.indexOf("text/html") !== -1 ||
            contentType.indexOf("text/css") !== -1 ||
            contentType.indexOf("javascript") !== -1 ||
            contentType.indexOf("application/javascript") !== -1 ||
            contentType.indexOf("image/") !== -1 ||
            contentType.indexOf("font/") !== -1 ||
            contentType.indexOf("application/manifest") !== -1 ||
            url.pathname.indexOf("/connect/icons/") === 0 ||
            url.pathname.indexOf("/connect/vendor/") === 0 ||
            url.pathname.endsWith(".webmanifest");

          if (cacheable) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, copy);
            });
          }

          return response;
        })
        .catch(function () {
          if (request.mode === "navigate") {
            return caches.match("/connect/index.html");
          }
          return caches.match(request);
        });
    })
  );
});
