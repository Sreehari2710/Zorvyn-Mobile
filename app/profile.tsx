import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform, StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { useThemeStore } from '@theme/useThemeStore';
import { useProfileStore, CURRENCIES } from '../store/profileStore';
import { useTransactionStore } from '../store/transactionStore';
import {
  User, Moon, Sun, Monitor, Download,
  ChevronRight, Check, ArrowLeft,
} from 'lucide-react-native';
import { exportTransactionsToCSV } from '../utils/exportData';
import { useToastStore } from '../store/toastStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const router = useRouter();
  const { name, setName, currencyCode, setCurrency } = useProfileStore();
  const { transactions } = useTransactionStore();
  const { show } = useToastStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert('Name Required', 'Please enter a valid name.');
      return;
    }
    setName(trimmed);
    setEditingName(false);
    show('Name updated!', 'success');
  };

  const handleExport = async () => {
    if (transactions.length === 0) {
      show('No transactions to export', 'error');
      return;
    }
    try {
      setExporting(true);
      await exportTransactionsToCSV(transactions);
    } catch (e: any) {
      show(e.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const THEME_OPTIONS: { label: string; value: 'light' | 'dark' | 'system'; icon: any }[] = [
    { label: 'Light', value: 'light', icon: Sun },
    { label: 'Dark', value: 'dark', icon: Moon },
    { label: 'System', value: 'system', icon: Monitor },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 52 : (RNStatusBar.currentHeight ?? 24) + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Avatar + Name Card */}
        <Animated.View entering={FadeInDown.delay(60)}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            <View style={styles.avatarRow}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={[theme.typography.heading1, { color: '#fff', fontSize: 26 }]}>{initials}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                {editingName ? (
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    style={[
                      theme.typography.heading2,
                      {
                        color: theme.colors.text,
                        borderBottomWidth: 2,
                        borderBottomColor: theme.colors.primary,
                        paddingBottom: 4,
                      },
                    ]}
                    autoFocus
                    onSubmitEditing={handleSaveName}
                    returnKeyType="done"
                    maxLength={40}
                  />
                ) : (
                  <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>{name || 'Tap to set name'}</Text>
                )}
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} recorded
                </Text>
              </View>
              {editingName ? (
                <TouchableOpacity onPress={handleSaveName} style={[styles.editIconBtn, { backgroundColor: theme.colors.primary }]}>
                  <Check size={18} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => { setNameInput(name); setEditingName(true); }}
                  style={[styles.editIconBtn, { backgroundColor: theme.colors.primary + '15' }]}
                >
                  <User size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Appearance Section */}
        <Animated.View entering={FadeInDown.delay(120)}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = themeMode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setThemeMode(opt.value)}
                    style={[
                      styles.themeBtn,
                      {
                        backgroundColor: isActive ? theme.colors.primary : theme.colors.background,
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Icon size={18} color={isActive ? '#fff' : theme.colors.textSecondary} />
                    <Text
                      style={[
                        theme.typography.caption,
                        { color: isActive ? '#fff' : theme.colors.textSecondary, marginTop: 4, fontWeight: isActive ? '700' : '400' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Currency Section */}
        <Animated.View entering={FadeInDown.delay(180)}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>CURRENCY</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            {CURRENCIES.map((c, idx) => {
              const isSelected = c.code === currencyCode;
              return (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => setCurrency(c.code, c.locale)}
                  style={[
                    styles.menuRow,
                    idx < CURRENCIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                  ]}
                >
                  <View style={[styles.currencySymbol, { backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.background }]}>
                    <Text style={[theme.typography.heading3, { color: isSelected ? theme.colors.primary : theme.colors.textSecondary }]}>
                      {c.symbol}
                    </Text>
                  </View>
                  <Text style={[theme.typography.body, { color: theme.colors.text, flex: 1, marginLeft: 12 }]}>{c.label}</Text>
                  {isSelected && <Check size={18} color={theme.colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Data Section */}
        <Animated.View entering={FadeInDown.delay(240)}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>DATA</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            <TouchableOpacity
              onPress={handleExport}
              style={styles.menuRow}
              disabled={exporting}
            >
              <View style={[styles.menuIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <Download size={18} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
                  {exporting ? 'Exporting…' : 'Export Transactions'}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Download as CSV file
                </Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
