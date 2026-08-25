import React, { useEffect } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import { updateNotificationSchedule } from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    updateNotificationSchedule();
  }, []);

  return <HomeScreen />;
}



