import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { loadNotificationTimes, saveNotificationTimes, loadFreezes, saveFreezes } from '../utils/storage';
import { updateNotificationSchedule } from '../utils/notifications';

const SettingsModal = ({ visible, onClose, theme, totalPoints, setTotalPoints }) => {
  const [times, setTimes] = useState([]);
  const [freezes, setFreezes] = useState(0);

  useEffect(() => {
    if (visible) {
      loadNotificationTimes().then(setTimes);
      loadFreezes().then(setFreezes);
    }
  }, [visible]);

  const handleToggleHour = async (hour) => {
    let newTimes;
    if (times.includes(hour)) {
      newTimes = times.filter(t => t !== hour);
    } else {
      newTimes = [...times, hour].sort((a,b) => a - b);
    }
    setTimes(newTimes);
    await saveNotificationTimes(newTimes);
    await updateNotificationSchedule(newTimes);
  };

  const handleBuyFreeze = async () => {
    if (totalPoints >= 50) {
      const newPoints = totalPoints - 50;
      const newFreezes = freezes + 1;
      setTotalPoints(newPoints);
      setFreezes(newFreezes);
      await saveFreezes(newFreezes);
      // NOTE: totalPoints needs to be saved back in HomeScreen via setTotalPoints
    } else {
      alert("Not enough points! Keep tracking habits to earn more! 💖");
    }
  };

  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings ✨</Text>
          
          <ScrollView style={styles.scroll}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shop 🛍️</Text>
              <View style={[styles.shopCard, { borderColor: theme.border }]}>
                <Text style={styles.shopItem}>❄️ Streak Freezes: {freezes}</Text>
                <Text style={styles.shopDesc}>Protects your streak if you miss a day!</Text>
                <TouchableOpacity 
                  style={[styles.buyBtn, { backgroundColor: theme.primary }]}
                  onPress={handleBuyFreeze}
                >
                  <Text style={styles.buyText}>Buy for 50 pts</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications 🔔</Text>
              <Text style={styles.sectionDesc}>Tap times below to toggle reminders.</Text>
              <View style={styles.timesGrid}>
                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(hour => {
                  const isActive = times.includes(hour);
                  return (
                    <TouchableOpacity 
                      key={hour} 
                      style={[
                        styles.timeBtn, 
                        isActive ? { backgroundColor: theme.primary, borderColor: theme.primary } : { borderColor: theme.border }
                      ]}
                      onPress={() => handleToggleHour(hour)}
                    >
                      <Text style={[styles.timeText, isActive ? { color: '#fff' } : { color: theme.text }]}>
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
          
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.secondary }]} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '80%',
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
    color: '#333',
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  shopCard: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  shopItem: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  shopDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  buyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 2,
  },
  timeText: {
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SettingsModal;
