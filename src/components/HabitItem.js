import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Heart, Trash } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AnimatedReanimated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

const HabitItem = ({ habit, isCompletedToday, onToggle, onEdit, onDelete, theme }) => {
  // Classic react-native Animated for the heart pop
  const scale = useRef(new Animated.Value(1)).current;

  // Reanimated values for 3D button press
  const pressed = useSharedValue(0);

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

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withSpring(pressed.value ? 4 : 0, { mass: 0.5, damping: 10, stiffness: 200 }) },
      ],
    };
  });

  const animatedBottomShadowStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(pressed.value ? 0 : 6, { mass: 0.5, damping: 10, stiffness: 200 }),
      marginTop: withSpring(pressed.value ? 0 : -6, { mass: 0.5, damping: 10, stiffness: 200 })
    };
  });

  const renderRightActions = (progress, dragX) => {
    return (
      <TouchableOpacity 
        style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]} 
        onPress={() => onDelete && onDelete(habit.id)}
      >
        <Trash color="white" size={24} />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <AnimatedReanimated.View style={[styles.containerWrapper]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => { pressed.value = 1; }}
          onPressOut={() => { pressed.value = 0; }}
          onPress={() => onToggle(habit.id, isCompletedToday)}
          onLongPress={() => onEdit(habit)}
          delayLongPress={500}
        >
          <AnimatedReanimated.View style={[
            styles.container,
            { backgroundColor: isCompletedToday ? theme.cardCompleted : '#fff', borderColor: isCompletedToday ? theme.borderCompleted : theme.border },
            animatedButtonStyle
          ]}>
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
          </AnimatedReanimated.View>
          
          <AnimatedReanimated.View style={[
            styles.bottomShadow,
            { backgroundColor: isCompletedToday ? theme.borderCompleted : theme.border },
            animatedBottomShadowStyle
          ]} />
        </TouchableOpacity>
      </AnimatedReanimated.View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    marginBottom: 15,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    zIndex: 2,
  },
  bottomShadow: {
    height: 6,
    borderRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -6,
    zIndex: 1,
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
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 20,
    marginBottom: 15,
    marginLeft: 10,
  }
});

export default HabitItem;
