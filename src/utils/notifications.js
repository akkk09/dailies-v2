import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export const updateNotificationSchedule = async (times = [9, 14, 19]) => {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ff4d85',
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') return false;
  }

  // Cancel all existing
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule new times
  for (const hour of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Dailies Time! 💕",
        body: "Your cute bunny misses you! Don't forget to track your habits!",
      },
      trigger: {
        hour: hour,
        minute: 0,
        repeats: true,
      },
    });
  }
  return true;
};
