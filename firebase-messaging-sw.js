importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBPKtBEFLvSQBuVzR9nB0Nx0G55_Ap0XTk",
  authDomain: "liga-familiar-fc25.firebaseapp.com",
  projectId: "liga-familiar-fc25",
  storageBucket: "liga-familiar-fc25.firebasestorage.app",
  messagingSenderId: "871975941322",
  appId: "1:871975941322:web:1f48918810572b3974f033"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Mensaje recibido:", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/icons/icon-192.png"
    }
  );
});
