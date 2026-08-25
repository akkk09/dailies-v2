import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Heart } from 'lucide-react-native';

const HabitItem = ({ habit, isCompletedToday, onToggle, onEdit, theme }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCompletedToday) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.5,
          friction: 3,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isCompletedToday]);

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { borderColor: theme.border, shadowColor: theme.secondary },
        isCompletedToday && { backgroundColor: theme.cardCompleted, borderColor: theme.borderCompleted }
      ]} 
      onPress={() => onToggle(habit.id, isCompletedToday)}
      onLongPress={() => onEdit(habit)}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <View style={styles.leftInfo}>
        <Text style={[styles.title, { color: theme.text }, isCompletedToday && { color: theme.textCompleted, textDecorationLine: 'line-through' }]}>
          {habit.title}
        </Text>
        <Text style={[styles.streak, { color: theme.primary }]}>
          🔥 {habit.streak} day streak
        </Text>
      </View>
      
      <Animated.View style={[
        styles.heartContainer, 
        { backgroundColor: theme.iconBackground },
        isCompletedToday && { backgroundColor: theme.iconBackgroundCompleted }, 
        { transform: [{ scale }] }
      ]}>
        <Heart 
          color={isCompletedToday ? "white" : theme.primary} 
          fill={isCompletedToday ? "white" : "transparent"} 
          size={28} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
  },
  leftInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  streak: {
    fontSize: 14,
    fontWeight: '600',
  },
  heartContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HabitItem;
