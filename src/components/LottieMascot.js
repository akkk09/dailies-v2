import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const LottieMascot = forwardRef((props, ref) => {
  const lottieRef = useRef(null);

  useImperativeHandle(ref, () => ({
    trigger: () => {
      if (lottieRef.current) {
        lottieRef.current.play();
      }
    }
  }));

  return (
    <View style={styles.container}>
      <LottieView
        ref={lottieRef}
        // Fallback generic celebration animation link
        source={{ uri: 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json' }}
        loop={false}
        style={styles.animation}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: 150,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default LottieMascot;
