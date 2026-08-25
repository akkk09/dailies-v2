import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { format, subDays } from 'date-fns';
import { Plus, Heart, Palette, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import { loadHabits, saveHabits, loadPoints, savePoints, loadTheme, saveTheme, loadFreezes, saveFreezes } from '../utils/storage';
import HabitItem from '../components/HabitItem';
import HabitModal from '../components/HabitModal';
import ThemeModal from '../components/ThemeModal';
import Mascot from '../components/Mascot';
import Heatmap from '../components/Heatmap';
import SettingsModal from '../components/SettingsModal';
import { themes } from '../constants/themes';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [habits, setHabits] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [themeKey, setThemeKey] = useState('pink');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  const [habitToEdit, setHabitToEdit] = useState(null);
  
  const mascotRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      let stored = await loadHabits();
      const points = await loadPoints();
      setTotalPoints(points);
      const storedTheme = await loadTheme();
      setThemeKey(storedTheme);

      // Simple Streak Freeze Logic
      const freezes = await loadFreezes();
      if (freezes > 0) {
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        let consumedFreeze = false;
        
        stored = stored.map(habit => {
          if (habit.streak > 0 && !habit.completedDates.includes(yesterdayStr) && !habit.completedDates.includes(todayStr)) {
            // They missed yesterday and hadn't completed today. Protect streak!
            consumedFreeze = true;
            return {
              ...habit,
              completedDates: [...habit.completedDates, yesterdayStr] // Fake a completion to protect
            };
          }
          return habit;
        });

        if (consumedFreeze) {
          await saveHabits(stored);
          await saveFreezes(freezes - 1);
          alert("❄️ A Streak Freeze was used to protect your streaks from yesterday!");
        }
      }
      setHabits(stored);
    };
    init();
  }, []);

  const currentTheme = themes[themeKey] || themes.pink;
  const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return false;
    const today = getTodayStr();
    return completedDates.includes(today);
  };

  const playSound = async () => {
    try {
      // Small pop sound from public url
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.freesound.org/previews/411/411639_5121236-lq.mp3' },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (e) {}
  };

  const handleToggleHabit = async (id, currentlyCompleted) => {
    const todayStr = getTodayStr();
    let newPoints = totalPoints;

    if (!currentlyCompleted) {
      newPoints += 10;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{});
      playSound();
      if (mascotRef.current) {
        mascotRef.current.trigger();
      }
    } else {
      newPoints = Math.max(0, newPoints - 10);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});
    }
    
    const newHabits = habits.map(habit => {
      if (habit.id === id) {
        let newDates = habit.completedDates || [];
        let newStreak = habit.streak || 0;
        
        if (currentlyCompleted) {
          newDates = newDates.filter(d => d !== todayStr);
          newStreak = Math.max(0, newStreak - 1);
        } else {
          newDates = [...newDates, todayStr];
          newStreak += 1;
        }
        
        return {
          ...habit,
          completedDates: newDates,
          streak: newStreak
        };
      }
      return habit;
    });

    setHabits(newHabits);
    setTotalPoints(newPoints);
    await saveHabits(newHabits);
    await savePoints(newPoints);
  };

  const handleSaveHabit = async (title, id) => {
    let newHabits;
    if (id) {
      newHabits = habits.map(h => (h.id === id ? { ...h, title } : h));
    } else {
      newHabits = [...habits, { id: Date.now().toString(), title, completedDates: [], streak: 0 }];
    }
    setHabits(newHabits);
    await saveHabits(newHabits);
    setModalVisible(false);
    setHabitToEdit(null);
  };

  const handleDeleteHabit = async (id) => {
    const newHabits = habits.filter(h => h.id !== id);
    setHabits(newHabits);
    await saveHabits(newHabits);
    setModalVisible(false);
    setHabitToEdit(null);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.headerTitle, { color: currentTheme.primary }]}>My Dailies 💖</Text>
          <Text style={[styles.headerDate, { color: currentTheme.secondary }]}>{format(new Date(), 'EEEE, MMMM do')}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <View style={{flexDirection: 'row', gap: 15, marginBottom: 8}}>
            <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
              <Bell color={currentTheme.primary} size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setThemeModalVisible(true)}>
              <Palette color={currentTheme.primary} size={28} />
            </TouchableOpacity>
          </View>
          <View style={[styles.pointsBadge, { backgroundColor: currentTheme.secondary, shadowColor: currentTheme.secondary }]}>
            <Heart color="#fff" fill="#fff" size={14} style={{marginRight: 4}} />
            <Text style={styles.pointsText}>{totalPoints} pts</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {renderHeader()}
        
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={<Heatmap habits={habits} theme={currentTheme} />}
          renderItem={({ item }) => (
            <HabitItem
              habit={item}
              isCompletedToday={isCompletedToday(item.completedDates)}
              onToggle={handleToggleHabit}
              onEdit={(habit) => { setHabitToEdit(habit); setModalVisible(true); }}
              theme={currentTheme}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.secondary }]}>No habits yet. Let's add some! 💕</Text>
            </View>
          }
        />

        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: currentTheme.primary, shadowColor: currentTheme.primary }]} 
          onPress={() => { setHabitToEdit(null); setModalVisible(true); }}
          activeOpacity={0.8}
        >
          <Plus color="#fff" size={32} />
        </TouchableOpacity>

        <HabitModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
          habitToEdit={habitToEdit}
        />

        <ThemeModal
          visible={themeModalVisible}
          onClose={() => setThemeModalVisible(false)}
          onSelectTheme={async (key) => { setThemeKey(key); await saveTheme(key); setThemeModalVisible(false); }}
          currentTheme={themeKey}
        />

        <SettingsModal
          visible={settingsModalVisible}
          onClose={() => setSettingsModalVisible(false)}
          theme={currentTheme}
          totalPoints={totalPoints}
          setTotalPoints={(pts) => { setTotalPoints(pts); savePoints(pts); }}
        />

        <Mascot ref={mascotRef} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 25 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 34, fontWeight: '900', marginBottom: 5 },
  headerDate: { fontSize: 16, fontWeight: '600' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5 },
  pointsText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  listContainer: { paddingHorizontal: 25, paddingBottom: 100 },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '500' },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 65, height: 65, borderRadius: 35, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 }
});

export default HomeScreen;
