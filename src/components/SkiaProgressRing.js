import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Path, Skia, SweepGradient, vec, Paint, useFont } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, withSpring, Easing } from 'react-native-reanimated';

const size = 60;
const strokeWidth = 8;
const radius = (size - strokeWidth) / 2;
const center = size / 2;

const SkiaProgressRing = ({ progress, theme }) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, { damping: 12, stiffness: 90 });
  }, [progress]);

  const path = Skia.Path.Make();
  path.addCircle(center, center, radius);

  return (
    <View style={styles.container}>
      <Canvas style={{ width: size, height: size }}>
        <Path
          path={path}
          strokeWidth={strokeWidth}
          style="stroke"
          color={theme.cardCompleted}
          strokeJoin="round"
          strokeCap="round"
        />
        <Path
          path={path}
          strokeWidth={strokeWidth}
          style="stroke"
          strokeJoin="round"
          strokeCap="round"
          start={0}
          end={animatedProgress}
        >
          <SweepGradient
            c={vec(center, center)}
            colors={[theme.primary, theme.secondary, theme.primary]}
          />
        </Path>
      </Canvas>
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: theme.primary }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default SkiaProgressRing;
