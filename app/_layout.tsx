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
import { getSeedTransactions } from '../utils/seedData';
import { useProfileStore } from '../store/profileStore';
import { User } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function OnboardingModal({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const { theme } = useTheme();
  const { setName, setHasLaunched } = useProfileStore();
  const [input, setInput] = useState('');

  const handleContinue = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setName(trimmed);
    setHasLaunched(true);
    onDone();
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            style={[styles.onboardingCard, { backgroundColor: theme.colors.surface }]}
          >
            {/* Icon */}
            <View style={[styles.onboardingIcon, { backgroundColor: theme.colors.primary + '18' }]}>
              <User size={36} color={theme.colors.primary} />
            </View>

            <Text style={[theme.typography.heading1, { color: theme.colors.text, textAlign: 'center', marginTop: 20 }]}>
              Welcome to Zorvyn
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }]}>
              Your personal finance companion.{'\n'}What should we call you?
            </Text>

            <View style={[styles.onboardingInput, { backgroundColor: theme.colors.background, borderColor: input ? theme.colors.primary : theme.colors.border }]}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Your name"
                placeholderTextColor={theme.colors.textSecondary}
                style={[theme.typography.heading3, { color: theme.colors.text, flex: 1 }]}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                maxLength={40}
              />
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              style={[
                styles.onboardingBtn,
                {
                  backgroundColor: input.trim() ? theme.colors.primary : theme.colors.neutral[300] as string,
                  opacity: input.trim() ? 1 : 0.7,
                },
              ]}
              disabled={!input.trim()}
            >
              <Text style={[theme.typography.heading3, { color: '#fff' }]}>Let's Go →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const { transactions, addTransaction } = useTransactionStore();
  const { hasLaunched } = useProfileStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function seedData() {
      try {
        const hasLaunchedFlag = await storage.getItem('has_launched');
        const currentTransactions = useTransactionStore.getState().transactions;

        if (currentTransactions.length > 50) {
          useTransactionStore.getState().clearTransactions();
          await storage.setItem('has_launched', '');
          return;
        }

        if (!hasLaunchedFlag && currentTransactions.length === 0) {
          const seeds = getSeedTransactions();
          const sortedSeeds = [...seeds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          sortedSeeds.forEach(t => addTransaction(t));
          await storage.setItem('has_launched', 'true');
        }
      } catch (e) {
        console.error('Failed to seed data', e);
      }
    }
    seedData();
  }, [addTransaction]);

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingCard: {
    width: '88%',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 20,
  },
  onboardingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 28,
    width: '100%',
  },
  onboardingBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
});
