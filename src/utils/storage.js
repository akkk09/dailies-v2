import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = '@habits_data';
const POINTS_KEY = '@points_data';

export const loadHabits = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HABITS_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    return [
      { id: '1', title: 'Drink Water', completedDates: [], streak: 0 },
      { id: '2', title: 'Wear Glasses', completedDates: [], streak: 0 },
    ];
  } catch (e) {
    console.error('Failed to load habits:', e);
    return [];
  }
};

export const saveHabits = async (habits) => {
  try {
    const jsonValue = JSON.stringify(habits);
    await AsyncStorage.setItem(HABITS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
};

export const loadPoints = async () => {
  try {
    const val = await AsyncStorage.getItem(POINTS_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    return 0;
  }
};

export const savePoints = async (points) => {
  try {
    await AsyncStorage.setItem(POINTS_KEY, points.toString());
  } catch (e) {}
};

const THEME_KEY = '@theme_data';
const NOTIF_KEY = '@notif_times_data';
const FREEZES_KEY = '@freezes_data';

export const loadTheme = async () => {
  try {
    const val = await AsyncStorage.getItem(THEME_KEY);
    return val || 'pink';
  } catch (e) {
    return 'pink';
  }
};

export const saveTheme = async (theme) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (e) {}
};

export const loadNotificationTimes = async () => {
  try {
    const val = await AsyncStorage.getItem(NOTIF_KEY);
    if (val != null) return JSON.parse(val);
    return [9, 14, 19];
  } catch (e) {
    return [9, 14, 19];
  }
};

export const saveNotificationTimes = async (times) => {
  try {
    await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(times));
  } catch (e) {}
};

export const loadFreezes = async () => {
  try {
    const val = await AsyncStorage.getItem(FREEZES_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    return 0;
  }
};

export const saveFreezes = async (freezes) => {
  try {
    await AsyncStorage.setItem(FREEZES_KEY, freezes.toString());
  } catch (e) {}
};
