import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useTodos } from '@/todos';

const CONFETTI_COLORS = ['#2563eb', '#f59e0b', '#16a34a', '#ec4899', '#8b5cf6'];
const CONFETTI_COUNT = 24;
const CELEBRATION_DURATION = 2400;

export function CompletionCelebration() {
  const { celebrationId } = useTodos();
  const { width, height } = useWindowDimensions();
  const [hiddenCelebrationId, setHiddenCelebrationId] = useState(0);
  const [particles] = useState(() =>
    Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(0)),
  );

  useEffect(() => {
    if (celebrationId === 0) return;

    particles.forEach((progress) => progress.setValue(0));
    const animation = Animated.stagger(
      24,
      particles.map((progress) =>
        Animated.timing(progress, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ),
    );
    animation.start();

    const timeout = setTimeout(
      () => setHiddenCelebrationId(celebrationId),
      CELEBRATION_DURATION,
    );
    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [celebrationId, particles]);

  if (celebrationId === 0 || celebrationId <= hiddenCelebrationId) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {particles.map((progress, index) => {
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, height * 0.78],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, index % 2 === 0 ? 20 : -20],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${index % 2 === 0 ? 540 : -540}deg`],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.12, 0.8, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: (index / (CONFETTI_COUNT - 1)) * (width - 10),
                backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
      <View accessibilityLiveRegion="polite" style={styles.banner}>
        <Text style={styles.message}>Well done!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    top: 16,
    width: 9,
    height: 14,
    borderRadius: 2,
  },
  banner: {
    marginTop: 16,
    backgroundColor: '#166534',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  message: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
