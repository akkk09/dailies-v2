import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';

let Rive, Alignment, Fit;
if (Platform.OS !== 'web') {
  const RiveModule = require('rive-react-native');
  Rive = RiveModule.default;
  Alignment = RiveModule.Alignment;
  Fit = RiveModule.Fit;
}

const RiveMascot = forwardRef((props, ref) => {
  const riveRef = useRef(null);
  
  const mascotUrl = 'https://public.rive.app/community/runtime-files/2195-4346-avatar-pack-use-case.riv';

  useImperativeHandle(ref, () => ({
    trigger: () => {
      if (riveRef.current && Platform.OS !== 'web') {
        try {
          riveRef.current.fireState('State Machine 1', 'celebrate');
        } catch (e) {
          console.warn("Rive state machine error:", e);
        }
      }
    }
  }));

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 60 }}>🐰</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Rive
        ref={riveRef}
        url={mascotUrl}
        artboardName="Avatar 1"
        stateMachineName="State Machine 1"
        alignment={Alignment?.Center}
        fit={Fit?.Contain}
        style={styles.riveAnimation}
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
  riveAnimation: {
    width: '100%',
    height: '100%',
  },
});

export default RiveMascot;
