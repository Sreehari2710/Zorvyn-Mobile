import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { useTransactionStore } from '../../store/transactionStore';
import { useGoalStore } from '../../store/goalStore';
import { useProfileStore } from '../../store/profileStore';
import {
  calculateBalance,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateWeeklyTotals,
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { TrendingUp, TrendingDown, ChevronRight, Zap, Flame } from 'lucide-react-native';
import { TransactionItem } from '../../components/TransactionItem';
import { FAB } from '../../components/FAB';
import { ProgressBar } from '../../components/ProgressBar';
import { CartesianChart, Bar } from 'victory-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { transactions } = useTransactionStore();
  const { activeGoal, streak } = useGoalStore();
  const { name, currencyCode, currencyLocale } = useProfileStore();

  const balance = useMemo(() => calculateBalance(transactions), [transactions]);
  const income = useMemo(() => calculateTotalIncome(transactions), [transactions]);
  const expense = useMemo(() => calculateTotalExpenses(transactions), [transactions]);
  const weeklyData = useMemo(() => calculateWeeklyTotals(transactions), [transactions]);

  const recentTransactions = useMemo(() =>
    [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4),
    [transactions]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const goalProgress = activeGoal ? Math.min((activeGoal.currentSaved / activeGoal.targetAmount) * 100, 100) : 0;

  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const fmt = (val: number) => formatCurrency(val, currencyCode, currencyLocale);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(0)} style={styles.header}>
          <View>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{greeting}</Text>
            <Text style={[theme.typography.heading1, { color: theme.colors.text }]}>{name || 'Welcome'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={[theme.typography.heading3, { color: '#fff', fontSize: 18 }]}>{initials}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Balance Hero Card ── */}
        <Animated.View entering={FadeInDown.delay(60)}>
          <View style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
            <Text style={[theme.typography.overline, { color: '#fff', opacity: 0.8 }]}>TOTAL BALANCE</Text>
            <Text style={[theme.typography.display, { color: '#fff', fontSize: 36, marginTop: 4 }]}>
              {fmt(balance)}
            </Text>
            <View style={styles.heroMetrics}>
              <View style={[styles.heroChip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <TrendingUp size={14} color="#fff" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' }}>INCOME</Text>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{fmt(income)}</Text>
                </View>
              </View>
              <View style={[styles.heroChip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <TrendingDown size={14} color="#fff" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' }}>EXPENSES</Text>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{fmt(expense)}</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Goal Card ── */}
        <Animated.View entering={FadeInDown.delay(120)}>
          <Pressable
            onPress={() => router.push('/(tabs)/goals')}
            style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Zap size={16} color={theme.colors.primary} fill={theme.colors.primary} />
                </View>
                <Text style={[theme.typography.heading3, { color: theme.colors.text, marginLeft: 10 }]}>Goal Progress</Text>
              </View>
              {streak.currentStreak > 0 && (
                <View style={[styles.streakPill, { backgroundColor: theme.colors.warning + '18' }]}>
                  <Flame size={12} color={theme.colors.warning} fill={theme.colors.warning} />
                  <Text style={[theme.typography.caption, { color: theme.colors.warning, fontWeight: '700', marginLeft: 4 }]}>
                    {streak.currentStreak}d streak
                  </Text>
                </View>
              )}
            </View>

            {activeGoal ? (
              <View style={{ marginTop: 12 }}>
                <ProgressBar progress={goalProgress} />
                <View style={styles.goalFooter}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    {fmt(activeGoal.currentSaved)} saved
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.primary, fontWeight: '700' }]}>
                    {Math.round(goalProgress)}% · target {fmt(activeGoal.targetAmount)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 10 }]}>
                Set a savings goal to track progress →
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* ── Weekly Spending ── */}
        <Animated.View entering={FadeInDown.delay(180)}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            <View style={styles.cardRow}>
              <Text style={[theme.typography.heading3, { color: theme.colors.text }]}>Weekly Spending</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>This week</Text>
            </View>
            <View style={{ height: 160, marginTop: 12 }}>
              <CartesianChart
                data={weeklyData}
                xKey="day"
                yKeys={['total']}
                domainPadding={{ left: 20, right: 20, top: 20 }}
              >
                {({ points, chartBounds }) => (
                  <Bar
                    points={points.total}
                    chartBounds={chartBounds}
                    color={theme.colors.primary}
                    roundedCorners={{ topLeft: 6, topRight: 6 }}
                    innerPadding={0.4}
                  />
                )}
              </CartesianChart>
            </View>
          </View>
        </Animated.View>

        {/* ── Recent Activity ── */}
        <Animated.View entering={FadeInDown.delay(240)}>
          <View style={styles.sectionHeader}>
            <Text style={[theme.typography.heading3, { color: theme.colors.text }]}>Recent Activity</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <View style={styles.seeAllRow}>
                <Text style={[theme.typography.caption, { color: theme.colors.primary, fontWeight: '600' }]}>See All</Text>
                <ChevronRight size={14} color={theme.colors.primary} />
              </View>
            </Pressable>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.elevation[1], paddingHorizontal: 0, paddingVertical: 4 }]}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, idx) => (
                <View key={tx.id}>
                  <TransactionItem transaction={tx} index={idx} />
                  {idx < recentTransactions.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyBox}>
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                  No recent transactions
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4F6EF7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  heroChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
});
