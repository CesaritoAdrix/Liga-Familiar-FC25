importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBPKtBEFLvSQBuVzR9nB0Nx0G55_Ap0XTk",
  authDomain: "liga-familiar-fc25.firebaseapp.com",
  projectId: "liga-familiar-fc25",
  storageBucket: "liga-familiar-fc25.firebasestorage.app",
  messagingSenderId: "871975941322",
  appId: "1:871975941322:web:1f48918810572b3974f033",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icons/icon-192.png",
  });
});

const CACHE_NAME = "liga-fc25-cache-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./historial.json",
  "./historialgfpp.json",
  "./historialgcpp.json",
];

// Instalar SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activar SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached || fetch(event.request).catch(() => caches.match("./index.html"))
      );
    })
  );
});
