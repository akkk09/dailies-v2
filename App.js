import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import { updateNotificationSchedule } from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    updateNotificationSchedule();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HomeScreen />
    </GestureHandlerRootView>
  );
}
