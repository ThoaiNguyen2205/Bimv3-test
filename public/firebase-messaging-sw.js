// https://github.com/firebase/quickstart-js/blob/master/messaging/firebase-messaging-sw.js
// https://github.com/badpaybad/firebase-web-notification/blob/master/public/firebase-messaging-sw.js
// https://github.com/firebase/quickstart-js/blob/master/messaging/index.html
// https://github.com/firebase/quickstart-js/issues/410

self.addEventListener('notificationclick', function(event) {
  const FCM_MSG_DATA = event.notification.data.FCM_MSG;
  let action_click = FCM_MSG_DATA.data.click_action;
  event.notification.close();

  event.waitUntil(
    clients.openWindow(action_click)
  );
});

// 7.14.2
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUUinFbP-_EGpCyq7YlBTyDRaWXI0hZgU",
  authDomain: "api-project-465458662532.firebaseapp.com",
  databaseURL: "https://api-project-465458662532.firebaseio.com",
  projectId: "api-project-465458662532",
  storageBucket: "api-project-465458662532.appspot.com",
  messagingSenderId: "465458662532",
  appId: "1:465458662532:web:f71c6bd192c1d2833146d1",
  measurementId: "G-CP73DD3M7M"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging(app);
messaging.setBackgroundMessageHandler(function(payload) {
    // console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = { 
      body: payload.notification.body, 
      icon: '/favicon.ico',
    };
  
    const notification = self.registration.showNotification(notificationTitle, notificationOptions);
    return notification;
});
