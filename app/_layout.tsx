import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import storage from '../store/storage';
import { useTransactionStore } from '../store/transactionStore';
import { useProfileStore } from '../store/profileStore';
import { User } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function OnboardingModal({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const { theme } = useTheme();
  const { setName, setHasLaunched } = useProfileStore();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleContinue = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setName(trimmed);
    setHasLaunched(true);
    onDone();
  };

  const backdropColor = theme.dark ? 'rgba(0,0,0,0.85)' : 'rgba(15,23,42,0.65)';

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent transparent>
      <View style={[styles.modalOverlay, { backgroundColor: backdropColor }]}>
        <KeyboardAvoidingView
          style={styles.modalContent}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View
            entering={FadeInDown.springify().damping(18).stiffness(100)}
            style={[
              styles.onboardingCard, 
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: theme.dark ? 1 : 0,
              }
            ]}
          >
            {/* Brand/Icon Section */}
            <View style={styles.brandSection}>
              <View style={[styles.onboardingIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <User size={38} color={theme.colors.primary} strokeWidth={2.2} />
              </View>
              <View style={[styles.brandBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.brandBadgeText}>ZORVYN</Text>
              </View>
            </View>

            <View style={styles.textSection}>
              <Text style={[theme.typography.heading1, { color: theme.colors.text, fontSize: 30, lineHeight: 36 }]}>
                Welcome
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12, fontSize: 16, lineHeight: 24 }]}>
                Your personal finance journey starts here. What should we call you?
              </Text>
            </View>

            <View style={[
              styles.onboardingInput, 
              { 
                backgroundColor: theme.dark ? theme.colors.background : '#F8FAFC',
                borderColor: isFocused ? theme.colors.primary : theme.colors.border,
                borderWidth: isFocused ? 2 : 1.5,
              }
            ]}>
              <TextInput
                value={input}
                onChangeText={setInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textSecondary + '80'}
                style={[theme.typography.heading3, { color: theme.colors.text, flex: 1, paddingVertical: 4 }]}
                selectionColor={theme.colors.primary}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                autoFocus
                maxLength={30}
              />
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.8}
              style={[
                styles.onboardingBtn,
                {
                  backgroundColor: input.trim() ? theme.colors.primary : (theme.dark ? '#334155' : '#E2E8F0'),
                  elevation: input.trim() ? 8 : 0,
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: input.trim() ? 0.3 : 0,
                  shadowRadius: 10,
                },
              ]}
              disabled={!input.trim()}
            >
              <Text style={[theme.typography.heading3, { 
                color: input.trim() ? '#fff' : theme.colors.textSecondary,
                fontWeight: '700' 
              }]}>
                Get Started
              </Text>
            </TouchableOpacity>

            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 24, opacity: 0.6 }]}>
              Secure · Private · Local
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const { transactions, addTransaction } = useTransactionStore();
  const { hasLaunched } = useProfileStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // No seeding needed, start with clean slate.
  }, []);

  // Show onboarding if profile has never been set up
  useEffect(() => {
    if (!hasLaunched) {
      const timer = setTimeout(() => setShowOnboarding(true), 200);
      return () => clearTimeout(timer);
    }
  }, [hasLaunched]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction/new"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="transaction/[id]"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
        <Stack.Screen name="debug" options={{ presentation: 'card', headerShown: true, title: 'Data Debug' }} />
      </Stack>

      <OnboardingModal visible={showOnboarding} onDone={() => setShowOnboarding(false)} />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  onboardingCard: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 24,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  onboardingIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  brandBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  onboardingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 20,
  },
  onboardingBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
});
