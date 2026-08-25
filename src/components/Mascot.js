import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

const Mascot = forwardRef((props, ref) => {
  const slideAnim = useRef(new Animated.Value(height)).current; // Start below screen
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  const [message, setMessage] = useState("Great job! 💖");

  const messages = [
    "Amazing! Keep it up!",
    "You're doing great! 💖",
    "One step closer! 🐰",
    "So proud of you!",
    "Streak protected! ✨"
  ];

  useImperativeHandle(ref, () => ({
    trigger: () => {
      // Pick random message
      setMessage(messages[Math.floor(Math.random() * messages.length)]);

      // Reset values
      slideAnim.setValue(height);
      bounceAnim.setValue(1);
      bubbleOpacity.setValue(0);

      // Sequence
      Animated.sequence([
        // Slide up
        Animated.spring(slideAnim, {
          toValue: height - 300, // 300px from bottom
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        // Show bubble
        Animated.timing(bubbleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Little bounce
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 1, duration: 150, useNativeDriver: true })
        ]),
        // Wait
        Animated.delay(2000),
        // Hide bubble
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // Slide down
        Animated.timing(slideAnim, {
          toValue: height + 100,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }));

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <Animated.View style={[styles.bubbleContainer, { opacity: bubbleOpacity }]}>
        <View style={styles.speechBubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
        <View style={styles.bubblePointer} />
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <Text style={styles.bunny}>🐰</Text>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  bunny: {
    fontSize: 120,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 10,
  },
  bubbleContainer: {
    alignItems: 'center',
    marginBottom: -10,
  },
  speechBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#ffb3c6',
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4d85',
  },
  bubblePointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 10,
    borderTopColor: '#fff',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  }
});

export default Mascot;
