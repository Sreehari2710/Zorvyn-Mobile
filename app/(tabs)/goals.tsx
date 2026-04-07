import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity,
  Platform, Modal, KeyboardAvoidingView, Alert, TextInput,
} from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { useGoalStore } from '../../store/goalStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useToastStore } from '../../store/toastStore';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { StreakStrip } from '../../components/StreakStrip';
import { GoalForm } from '../../components/GoalForm';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../utils/currency';
import {
  calculateDailySpendAverage,
  calculateProjectedSavings,
  getDaysRemainingInMonth,
} from '../../utils/calculations';
import {
  Target, Flame, ChevronDown, ChevronUp, Plus,
  Edit2, Calendar, TrendingUp, Info, Zap, Trash2, Check,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GoalHistory } from '../../models/goal';

export default function GoalsScreen() {
  const { theme } = useTheme();
  const { transactions } = useTransactionStore();
  const {
    activeGoal, streak, goalHistory,
    setGoal, updateGoal, syncGoalProgress, archiveGoal, deleteGoal,
    deleteHistoryItem, updateHistoryItem,
  } = useGoalStore();
  const { show } = useToastStore();

  const [isGoalSheetVisible, setGoalSheetVisible] = useState(false);
  const [isHistoryExpanded, setHistoryExpanded] = useState(false);
  const [editingHistoryItem, setEditingHistoryItem] = useState<GoalHistory | null>(null);

  useEffect(() => {
    if (activeGoal) syncGoalProgress(transactions);
  }, [transactions, activeGoal]);

  const progress = activeGoal
    ? Math.min((activeGoal.currentSaved / activeGoal.targetAmount) * 100, 100)
    : 0;
  const daysRemaining = getDaysRemainingInMonth();
  const dailyAvg = useMemo(() => calculateDailySpendAverage(transactions), [transactions]);
  const projected = useMemo(
    () => calculateProjectedSavings(activeGoal?.currentSaved || 0),
    [activeGoal?.currentSaved]
  );

  const handleSaveGoal = (goalData: any) => {
    if (activeGoal) {
      updateGoal(goalData);
      show('Goal updated!', 'success');
    } else {
      const newGoal = { id: `goal-${Date.now()}`, currentSaved: 0, createdAt: new Date(), ...goalData };
      setGoal(newGoal);
      syncGoalProgress(transactions);
      show('Monthly goal set!', 'success');
    }
    setGoalSheetVisible(false);
  };

  const handleDeleteGoal = () => {
    Alert.alert('Delete Goal', 'Remove the active goal? This will not create a history entry.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteGoal(); show('Goal deleted', 'success'); },
      },
    ]);
  };

  const handleDeleteHistoryItem = (goalId: string) => {
    Alert.alert('Delete Record', 'Remove this history entry permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteHistoryItem(goalId); show('History entry deleted', 'success'); },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <View>
          <Text style={[theme.typography.heading1, { color: theme.colors.text }]}>Savings Goals</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
            Track your monthly progress
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setGoalSheetVisible(true)}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Active Goal Card ── */}
        <Animated.View entering={FadeInUp.delay(80)}>
          <View style={[styles.goalCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            {activeGoal ? (
              <>
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <View style={styles.goalInfo}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Target size={22} color={theme.colors.primary} />
                    </View>
                    <View>
                      <Text style={[theme.typography.heading3, { color: theme.colors.text }]}>Monthly Target</Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        {new Date(activeGoal.year, activeGoal.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => setGoalSheetVisible(true)} style={[styles.iconBtn, { backgroundColor: theme.colors.primary + '10' }]}>
                      <Edit2 size={15} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteGoal} style={[styles.iconBtn, { backgroundColor: theme.colors.expense + '10', marginLeft: 8 }]}>
                      <Trash2 size={15} color={theme.colors.expense} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                  <ProgressBar progress={progress} />
                  <View style={styles.progressLabels}>
                    <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
                      {formatCurrency(activeGoal.currentSaved)}{' '}
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>saved</Text>
                    </Text>
                    <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
                      {formatCurrency(activeGoal.targetAmount)}{' '}
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>target</Text>
                    </Text>
                  </View>
                </View>

                {/* Streak badge */}
                <View style={[styles.streakBadge, { backgroundColor: theme.colors.warning + '12' }]}>
                  <Flame size={15} color={theme.colors.warning} fill={theme.colors.warning} />
                  <Text style={[theme.typography.caption, { color: theme.colors.warning, fontWeight: '700', marginLeft: 6 }]}>
                    {streak.currentStreak} DAY STREAK
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                    · Best: {streak.longestStreak}d
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyGoal}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '10', width: 64, height: 64, borderRadius: 32 }]}>
                  <Target size={32} color={theme.colors.primary} />
                </View>
                <Text style={[theme.typography.heading3, { color: theme.colors.text, marginTop: 16 }]}>No Active Goal</Text>
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20 }]}>
                  Set a savings target for{' '}
                  {new Date().toLocaleString('default', { month: 'long' })} to start tracking.
                </Text>
                <Button label="Set Monthly Goal" onPress={() => setGoalSheetVisible(true)} />
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Goal Met! ── */}
        {activeGoal && progress >= 100 && (() => {
          const now = new Date();
          const goalMonth = activeGoal.month - 1; // 0-indexed
          const goalYear = activeGoal.year;
          // Show if we're in the last 3 days of the goal month, or the month has passed
          const isGoalMonthOver = (now.getFullYear() > goalYear) || (now.getFullYear() === goalYear && now.getMonth() > goalMonth);
          const isEndOfGoalMonth = now.getFullYear() === goalYear && now.getMonth() === goalMonth && daysRemaining <= 3;
          return (isGoalMonthOver || isEndOfGoalMonth) ? (
            <Animated.View entering={FadeInUp}>
              <View style={[styles.celebCard, { backgroundColor: theme.colors.income + '10', borderColor: theme.colors.income }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.income }]}>
                  <Check size={20} color="#fff" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[theme.typography.heading3, { color: theme.colors.income }]}>Goal Achieved! 🎉</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    You've hit your target for{' '}
                    {new Date(activeGoal.year, activeGoal.month - 1).toLocaleString('default', { month: 'long' })}!
                  </Text>
                </View>
                <Button label="Archive" onPress={() => archiveGoal()} size="sm" style={{ width: 82 }} />
              </View>
            </Animated.View>
          ) : null;
        })()}

        {/* ── Strategy ── */}
        {activeGoal && progress < 100 && (
          <Animated.View entering={FadeInUp.delay(100)}>
            <View style={[styles.strategyCard, { backgroundColor: theme.colors.primary + '08', borderLeftColor: theme.colors.primary }]}>
              <View style={styles.tileHeader}>
                <Zap size={15} color={theme.colors.warning} />
                <Text style={[theme.typography.overline, { color: theme.colors.textSecondary, marginLeft: 6 }]}>Smart Strategy</Text>
              </View>
              <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 6, lineHeight: 20 }]}>
                {projected >= activeGoal.targetAmount
                  ? `You're on track! Keep daily spend below ${formatCurrency(dailyAvg + 10)} to stay safe.`
                  : `To reach your goal, try keeping daily spend under ${formatCurrency(Math.max(0, (activeGoal.targetAmount - activeGoal.currentSaved) / (daysRemaining || 1)))}.`}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ── This Week Streak ── */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <View style={styles.sectionHeader}>
            <Text style={[theme.typography.heading3, { color: theme.colors.text }]}>This Week</Text>
            <View style={styles.streakInfo}>
              <Flame size={13} color={theme.colors.warning} />
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 4 }]}>
                Next milestone: {streak.currentStreak + 1}d
              </Text>
            </View>
          </View>
          <View style={[styles.streakCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            <StreakStrip streakDates={streak.streakDates} />
          </View>
        </Animated.View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {[
            {
              icon: <Calendar size={14} color={theme.colors.primary} />,
              label: 'REMAINS',
              value: `${daysRemaining}d`,
              sub: 'In month',
              color: theme.colors.text,
              delay: 200,
            },
            {
              icon: <TrendingUp size={14} color={theme.colors.income} />,
              label: 'FORECAST',
              value: formatCurrency(projected),
              sub: 'By month end',
              color: theme.colors.income,
              delay: 280,
            },
            {
              icon: <Info size={14} color={theme.colors.expense} />,
              label: 'AVG SPEND',
              value: formatCurrency(dailyAvg),
              sub: 'Daily avg',
              color: theme.colors.expense,
              delay: 360,
            },
          ].map((stat) => (
            <Animated.View key={stat.label} entering={FadeInUp.delay(stat.delay)} style={{ flex: 1 }}>
              <View style={[styles.statTile, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
                <View style={styles.tileHeader}>
                  {stat.icon}
                  <Text style={[theme.typography.overline, { color: theme.colors.textSecondary, marginLeft: 4, flex: 1 }]} numberOfLines={1}>
                    {stat.label}
                  </Text>
                </View>
                <Text style={[theme.typography.heading2, { color: stat.color, marginTop: 6 }]} numberOfLines={1} adjustsFontSizeToFit>
                  {stat.value}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  {stat.sub}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* ── Goal History ── */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <Pressable onPress={() => setHistoryExpanded(!isHistoryExpanded)} style={styles.accordionHeader}>
            <Text style={[theme.typography.heading3, { color: theme.colors.text }]}>Goal History</Text>
            <View style={styles.accordionRight}>
              {goalHistory.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Text style={[theme.typography.caption, { color: theme.colors.primary, fontWeight: '700' }]}>
                    {goalHistory.length}
                  </Text>
                </View>
              )}
              {isHistoryExpanded ? (
                <ChevronUp size={20} color={theme.colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={theme.colors.textSecondary} />
              )}
            </View>
          </Pressable>

          {isHistoryExpanded && (
            goalHistory.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                  No completed goals yet
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {goalHistory.map((item) => (
                  <View key={item.goalId} style={[styles.historyCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
                    <View style={styles.historyLeft}>
                      <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
                        {new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                        Saved {formatCurrency(item.savedAmount)} of {formatCurrency(item.targetAmount)}
                      </Text>
                      {/* Mini progress bar */}
                      <View style={[styles.miniBar, { backgroundColor: theme.colors.border }]}>
                        <View
                          style={[
                            styles.miniFill,
                            {
                              width: `${Math.min((item.savedAmount / item.targetAmount) * 100, 100)}%`,
                              backgroundColor: item.met ? theme.colors.income : theme.colors.warning,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <View style={[styles.metBadge, { backgroundColor: item.met ? theme.colors.income + '15' : theme.colors.expense + '12' }]}>
                        <Text style={[theme.typography.caption, { color: item.met ? theme.colors.income : theme.colors.expense, fontWeight: '700' }]}>
                          {item.met ? '✓ MET' : '✗ MISS'}
                        </Text>
                      </View>
                      <View style={styles.historyActions}>
                        <TouchableOpacity
                          onPress={() => setEditingHistoryItem(item)}
                          style={[styles.historyActionBtn, { backgroundColor: theme.colors.primary + '10' }]}
                        >
                          <Edit2 size={13} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteHistoryItem(item.goalId)}
                          style={[styles.historyActionBtn, { backgroundColor: theme.colors.expense + '10', marginLeft: 6 }]}
                        >
                          <Trash2 size={13} color={theme.colors.expense} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Goal Form Modal */}
      <Modal
        visible={isGoalSheetVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setGoalSheetVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <Pressable style={styles.modalBackdrop} onPress={() => setGoalSheetVisible(false)} />
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.handleBar, { backgroundColor: theme.colors.border }]} />
            </View>
            <GoalForm
              key={isGoalSheetVisible ? 'active' : 'hidden'}
              initialData={activeGoal}
              onSave={handleSaveGoal}
              onCancel={() => setGoalSheetVisible(false)}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* History Edit Modal (simple target amount edit) */}
      <Modal
        visible={!!editingHistoryItem}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setEditingHistoryItem(null)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditingHistoryItem(null)} />
          {editingHistoryItem && (
            <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHandle}>
                <View style={[styles.handleBar, { backgroundColor: theme.colors.border }]} />
              </View>
              <HistoryEditForm
                item={editingHistoryItem}
                onSave={(updates) => {
                  updateHistoryItem(editingHistoryItem.goalId, updates);
                  show('History updated!', 'success');
                  setEditingHistoryItem(null);
                }}
                onCancel={() => setEditingHistoryItem(null)}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// Inline history edit form component
function HistoryEditForm({ item, onSave, onCancel }: {
  item: GoalHistory;
  onSave: (updates: { savedAmount?: number; targetAmount?: number }) => void;
  onCancel: () => void;
}) {
  const { theme } = useTheme();
  const [saved, setSaved] = useState(item.savedAmount.toString());
  const [target, setTarget] = useState(item.targetAmount.toString());

  const handleSave = () => {
    const s = parseFloat(saved);
    const t = parseFloat(target);
    if (isNaN(s) || isNaN(t) || t <= 0) return;
    onSave({ savedAmount: s, targetAmount: t });
  };

  const monthLabel = new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <View style={{ padding: 24 }}>
      <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>Edit History</Text>
      <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 24 }]}>{monthLabel}</Text>

      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>AMOUNT SAVED (₹)</Text>
      <View style={[styles.editInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        <TextInput
          value={saved}
          onChangeText={setSaved}
          keyboardType="numeric"
          style={[theme.typography.heading3, { color: theme.colors.text }]}
          placeholder="0"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6, marginTop: 16 }]}>TARGET AMOUNT (₹)</Text>
      <View style={[styles.editInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        <TextInput
          value={target}
          onChangeText={setTarget}
          keyboardType="numeric"
          style={[theme.typography.heading3, { color: theme.colors.text }]}
          placeholder="0"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
        <Button label="Cancel" onPress={onCancel} variant="ghost" style={{ flex: 1 }} />
        <Button label="Save" onPress={handleSave} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4F6EF7', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  scrollContent: { paddingHorizontal: 20 },
  goalCard: {
    borderRadius: 20, padding: 18, marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 18,
  },
  goalInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  progressSection: { marginBottom: 16 },
  progressLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,
  },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  emptyGoal: { alignItems: 'center', paddingVertical: 12 },
  celebCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1.5,
  },
  strategyCard: {
    borderRadius: 14, padding: 14, marginBottom: 14, borderLeftWidth: 4,
  },
  tileHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10, marginTop: 4,
  },
  streakInfo: { flexDirection: 'row', alignItems: 'center' },
  streakCard: { borderRadius: 16, padding: 14, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statTile: {
    borderRadius: 14, padding: 12, justifyContent: 'space-between',
  },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12,
  },
  accordionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyHistory: { padding: 20, alignItems: 'center' },
  historyList: { gap: 10, marginTop: 4 },
  historyCard: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start' },
  historyLeft: { flex: 1 },
  historyRight: { alignItems: 'flex-end', gap: 10, marginLeft: 12 },
  miniBar: {
    height: 4, borderRadius: 2, overflow: 'hidden',
    marginTop: 8, backgroundColor: '#e5e7eb',
  },
  miniFill: { height: '100%', borderRadius: 2 },
  metBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  historyActions: { flexDirection: 'row', alignItems: 'center' },
  historyActionBtn: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  // Modal
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', minHeight: 400,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
  },
  modalHandle: { alignItems: 'center', paddingVertical: 12 },
  handleBar: { width: 40, height: 5, borderRadius: 3 },
  editInput: {
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
});
