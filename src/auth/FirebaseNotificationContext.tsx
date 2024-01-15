import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import { initializeApp } from "firebase/app";
import { Messaging, getMessaging, onMessage, getToken } from "firebase/messaging";
import { FIREBASE_API, FIREBASE_PUBLIC_VAPID_KEY } from '../config-global';
import { FirebaseNotificationContextType } from './types';

// ----------------------------------------------------------------------

export const FirebaseNotificationContext = createContext<FirebaseNotificationContextType | null>(null);

type initialState = {
  messaging: Messaging | null;
  notifyPermission: string | null;
  currentMessage: any | null;
  currentDeviceToken: string | null;
};

// ----------------------------------------------------------------------

const app = initializeApp(FIREBASE_API);

type FirebaseNotificationProps = {
  children: React.ReactNode;
};

export function FirebaseNotificationProvider({ children }: FirebaseNotificationProps) {

  const [state, dispatch] = useState<initialState>({
        messaging: null,
        notifyPermission: null,
        currentMessage: null,
        currentDeviceToken: null
    });

    const isNotificationSupported = () =>
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window

    const initialize = useCallback(() => {
      requestPermission();
    }, []);

    const initializeMessage = useCallback(() => {
      const messaging = getMessaging(app);
      dispatch({
        ...state,
        messaging
      })
    }, [])

    useEffect(() => {
      if (isNotificationSupported()) {
        if ('safari' in window) {
          // waiting for user gesture
          window.addEventListener('click', function(e) {
            if (state.currentDeviceToken == null) {
              initialize();
            }
          });
        } else {
          // Chrome/FF/Edge
          initialize();
        }
      }
    }, [initialize]);

    useEffect(() => {
      initializeMessage();
    }, [state.notifyPermission]);

    useEffect(() => {
      getDeviceToken();
      receiveMessage();
    }, [state.notifyPermission, state.messaging])

    const requestPermission = () => {
      Notification.requestPermission().then((permission) => {
        dispatch({...state, notifyPermission: permission})
        console.log("🚀 ~ file: FirebaseNotificationContext.tsx:57 ~ Notification.requestPermission ~ permission:", permission)
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          // TODO(developer): Retrieve a registration token for use with FCM.
          // In many cases once an app has been granted notification permission,
          // it should update its UI reflecting this.
        } else if (Notification && Notification.permission !== "denied") {
          Notification.requestPermission().then((status) => {
            dispatch({...state, notifyPermission: status})
            console.log("🚀 ~ file: FirebaseNotificationContext.tsx:57 ~ Notification.requestPermission ~ status:", status)
            // If the user said okay
            if (status === "granted") {
              console.log('Notification permission granted.');
            }
          });
        } else {
          console.log('Unable to get permission to notify.');
        }
      });
    }
    
    const getDeviceToken = () => {
      if (state.messaging === null) return;
      getToken(state.messaging, { vapidKey: FIREBASE_PUBLIC_VAPID_KEY }).then((currentToken) => {
        if (currentToken) {
          console.log("🚀 ~ file: FirebaseNotificationContext.tsx:71 ~ getToken ~ currentToken:", currentToken)
          // Send the token to your server and update the UI if necessary
          // ...
          dispatch({...state, currentDeviceToken: currentToken});
        } else {
          // Show permission request UI
          console.log('No registration token available. Request permission to generate one.');
          // ...
        }
      }).catch((err) => {
        console.log('An error occurred while retrieving token. ', 'The notification permission was not granted and blocked instead.');
        // ...
      });
    }
    
    const receiveMessage = () => {
      if (state.messaging === null) return;
      onMessage(state.messaging, (payload: any) => {
        console.log('Message received. ', payload);
        // Update the UI to include the received message.
        if (payload === null) return;
        const notificationTitle = payload.notification.title;
        const notificationOptions = { 
          body: payload.notification.body, 
          icon: '/favicon.ico',
          image: '/assets/img/logo-clinic.png',
          data:{
            time: new Date(Date.now()).toString(),
            ...payload.data
          }
        };
        const notification = new Notification(notificationTitle, notificationOptions);
        console.log("🚀 ~ file: firebase-push-notification.service.ts:95 ~ FirebasePushNotificationService ~ onMessage ~ notification:", notification)
        notification.onclick = (event: any) => {
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          // window.open("http://www.mozilla.org", "_blank");
          // console.log("On notification click: ", event);
  
          const action_click = event.currentTarget.data.click_action;
          event.currentTarget.close();
  
          window.open(action_click);
        };
  
        dispatch({...state, currentMessage: payload});
      });
    };
    
    const memoizedValue = useMemo(
      () => ({
        messaging: state.messaging,
        notifyPermission: state.notifyPermission,
        currentMessage: state.currentMessage,
        currentDeviceToken: state.currentDeviceToken,
      }),
      [
        state.messaging,
        state.notifyPermission,
        state.currentMessage,
        state.currentDeviceToken,
      ]
    );

    return <FirebaseNotificationContext.Provider value={memoizedValue}>{children}</FirebaseNotificationContext.Provider>;
}
