import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Rive, { Alignment, Fit } from 'rive-react-native';

const RiveMascot = forwardRef((props, ref) => {
  const riveRef = useRef(null);
  
  // NOTE: You must provide a valid Rive file URL or asset bundle.
  // We're using a placeholder URL here. You should download a mascot .riv 
  // from the Rive community and place it in your assets folder, then use resourceName="mascot"
  const mascotUrl = 'https://public.rive.app/community/runtime-files/2195-4346-avatar-pack-use-case.riv';

  useImperativeHandle(ref, () => ({
    trigger: () => {
      // Trigger celebrating state in the state machine (if it exists)
      if (riveRef.current) {
        try {
          riveRef.current.fireState('State Machine 1', 'celebrate');
        } catch (e) {
          console.warn("Rive state machine error:", e);
        }
      }
    }
  }));

  return (
    <View style={styles.container}>
      <Rive
        ref={riveRef}
        url={mascotUrl}
        artboardName="Avatar 1"
        stateMachineName="State Machine 1"
        alignment={Alignment.Center}
        fit={Fit.Contain}
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
