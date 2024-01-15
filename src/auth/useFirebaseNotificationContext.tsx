import { useContext } from 'react';
//
import { FirebaseNotificationContext } from './FirebaseNotificationContext';

// ----------------------------------------------------------------------

export const useFirebaseNotificationContext = () => {
  const context = useContext(FirebaseNotificationContext);

  if (!context) throw new Error('FirebaseNotificationContext context must be use inside FirebaseNotificationProvider');

  return context;
};
