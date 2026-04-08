import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Pressable, 
  Dimensions, 
  BackHandler,
  Keyboard,
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import { 
  Gesture, 
  GestureDetector 
} from 'react-native-gesture-handler';
import { useTheme } from '@theme/ThemeProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isVisible, 
  onClose, 
  children,
  height = SCREEN_HEIGHT * 0.4
}) => {
  const { theme } = useTheme();
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(event.translationY + context.value.y, SCREEN_HEIGHT - height);
    })
    .onEnd((event) => {
      if (event.translationY > height / 3 || event.velocityY > 500) {
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(SCREEN_HEIGHT - height, { duration: 300 });
      }
    });

  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(SCREEN_HEIGHT - height, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [isVisible, height]);

  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isVisible, onClose]);

  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value }
      ],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isVisible ? 1 : 0),
    };
  });

  // interaction handled by pointerEvents

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isVisible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.sheet, 
          { 
            backgroundColor: theme.colors.surface, 
            height: height + insets.top,
            paddingTop: insets.top,
            ...theme.elevation[3]
          }, 
          animatedStyle
        ]}
      >
        <GestureDetector gesture={gesture}>
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          </View>
        </GestureDetector>
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  content: {
    flex: 1,
  },
});
