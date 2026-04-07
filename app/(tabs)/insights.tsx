import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Platform } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { useTransactionStore } from '../../store/transactionStore';
import {
  getTransactionsForPeriod,
  calculateCategoryBreakdown,
  calculateWeekOverWeek,
  getTopCategory,
  getLargestExpense,
  getTrendData,
  TimePeriod,
} from '../../utils/analytics';
import { getCategoryConfig } from '../../utils/categories';
import { formatCurrency } from '../../utils/currency';
import { Card } from '../../components/Card';
import { CartesianChart, Bar, Pie, PolarChart } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Target, BarChart2, AlertCircle, Wallet,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 80;

const PERIODS: { label: string; value: TimePeriod }[] = [
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: '3 Months', value: '3months' },
];

export default function InsightsScreen() {
  const { theme } = useTheme();
  const { transactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('thisMonth');

  const font = useFont(require('../../assets/fonts/Inter-Regular.ttf'), 11);

  const periodTransactions = useMemo(
    () => getTransactionsForPeriod(transactions, selectedPeriod),
    [transactions, selectedPeriod]
  );

  const breakdown = useMemo(
    () => calculateCategoryBreakdown(periodTransactions),
    [periodTransactions]
  );

  const topCategory = useMemo(() => getTopCategory(breakdown), [breakdown]);
  const wow = useMemo(() => calculateWeekOverWeek(transactions), [transactions]);
  const largestExpense = useMemo(() => getLargestExpense(periodTransactions), [periodTransactions]);

  const trendData = useMemo(
    () => getTrendData(transactions, selectedPeriod),
    [transactions, selectedPeriod]
  );

  const chartData = useMemo(
    () => trendData.map((d, i) => ({ x: i, amount: d.amount })),
    [trendData]
  );
  const chartLabels = trendData.map(d => d.label);

  const pieData = useMemo(
    () => breakdown.map(item => ({
      value: item.amount,
      color: getCategoryConfig(item.category).text,
      label: item.category,
    })),
    [breakdown]
  );

  const topCategoryConfig = topCategory ? getCategoryConfig(topCategory.category) : null;
  const hasExpenses = periodTransactions.some(t => t.type === 'expense');
  const hasEnoughTrendData = trendData.filter(d => d.amount > 0).length >= 2;
  const largestExpenseCategoryConfig = largestExpense ? getCategoryConfig(largestExpense.category) : null;

  // Net savings
  const periodIncome = periodTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const periodExpense = periodTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? (netSavings / periodIncome) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 52 : 36 }]}>
        <View>
          <Text style={[theme.typography.heading1, { color: theme.colors.text }]}>Insights</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>Analytics & Trends</Text>
        </View>
      </View>

      {/* Period Tabs */}
      <View style={[styles.periodBar, { backgroundColor: theme.colors.neutral[100] as string }]}>
        {PERIODS.map(p => {
          const isActive = selectedPeriod === p.value;
          return (
            <Pressable
              key={p.value}
              onPress={() => setSelectedPeriod(p.value)}
              style={[styles.periodBtn, isActive && { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}
            >
              <Text style={[
                theme.typography.bodyMedium,
                { fontSize: 13, color: isActive ? theme.colors.text : theme.colors.textSecondary, fontWeight: isActive ? '600' : '400' },
              ]}>
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Net Savings Summary Card ── */}
        <Animated.View entering={FadeInUp.delay(40)}>
          <View style={[styles.netCard, {
            backgroundColor: netSavings >= 0 ? theme.colors.income + '10' : theme.colors.expense + '10',
            borderColor: netSavings >= 0 ? theme.colors.income : theme.colors.expense,
          }]}>
            <View style={styles.netRow}>
              <View style={[styles.netIconBox, { backgroundColor: netSavings >= 0 ? theme.colors.income : theme.colors.expense }]}>
                <Wallet size={18} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[theme.typography.overline, { color: theme.colors.textSecondary }]}>NET SAVINGS</Text>
                <Text style={[theme.typography.heading2, { color: netSavings >= 0 ? theme.colors.income : theme.colors.expense }]}>
                  {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Savings Rate</Text>
                <Text style={[theme.typography.heading3, { color: netSavings >= 0 ? theme.colors.income : theme.colors.expense }]}>
                  {Math.round(savingsRate)}%
                </Text>
              </View>
            </View>
            <View style={styles.netChips}>
              <View style={styles.netChip}>
                <TrendingUp size={12} color={theme.colors.income} />
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 4 }]}>
                  Income {formatCurrency(periodIncome)}
                </Text>
              </View>
              <View style={styles.netChip}>
                <TrendingDown size={12} color={theme.colors.expense} />
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 4 }]}>
                  Spent {formatCurrency(periodExpense)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Top Category ── */}
        <Animated.View entering={FadeInUp.delay(80)}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                <TrendingUp size={16} color={theme.colors.primary} />
              </View>
              <Text style={[theme.typography.overline, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                Top Spending Category
              </Text>
            </View>
            {topCategory && topCategoryConfig ? (
              <View style={styles.topCatRow}>
                <View style={[styles.topCatIcon, { backgroundColor: topCategoryConfig.bg }]}>
                  <topCategoryConfig.icon size={24} color={topCategoryConfig.text} />
                </View>
                <View style={styles.topCatTexts}>
                  <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>{topCategory.category}</Text>
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                    {formatCurrency(topCategory.amount)} · {Math.round(topCategory.percentage)}% of spend
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyRow}>
                <AlertCircle size={16} color={theme.colors.neutral[300] as string} />
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                  No expenses in this period
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Vs Last Week + Largest Expense Row ── */}
        <View style={styles.twoColRow}>
          <Animated.View entering={FadeInUp.delay(120)} style={{ flex: 1 }}>
            <View style={[styles.halfCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
              <Text style={[theme.typography.overline, { color: theme.colors.textSecondary }]}>Vs. Last Week</Text>
              <View style={styles.wowValueRow}>
                <Text style={[theme.typography.heading2, {
                  color: wow.trend === 'up' ? theme.colors.expense : theme.colors.income,
                }]}>
                  {Math.abs(Math.round(wow.percentageChange))}%
                </Text>
                {wow.trend === 'up' ? (
                  <ArrowUpRight size={18} color={theme.colors.expense} />
                ) : (
                  <ArrowDownRight size={18} color={theme.colors.income} />
                )}
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                This wk: {formatCurrency(wow.currentWeekExpenses)}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Last wk: {formatCurrency(wow.lastWeekExpenses)}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(160)} style={{ flex: 1 }}>
            <View style={[styles.halfCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
              <Text style={[theme.typography.overline, { color: theme.colors.textSecondary }]}>Largest Expense</Text>
              {largestExpense ? (
                <>
                  <Text style={[theme.typography.heading2, { color: theme.colors.expense, marginTop: 4 }]} numberOfLines={1}>
                    {formatCurrency(largestExpense.amount)}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                    {largestExpense.notes || largestExpense.category}
                  </Text>
                  {largestExpenseCategoryConfig && (
                    <View style={[styles.catPill, { backgroundColor: largestExpenseCategoryConfig.bg }]}>
                      <Text style={[theme.typography.caption, { color: largestExpenseCategoryConfig.text, fontWeight: '600' }]}>
                        {largestExpense.category}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 8 }]}>No records</Text>
              )}
            </View>
          </Animated.View>
        </View>

        {/* ── Spending Trend Chart ── */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.sectionHeader}>
            <Text style={[theme.typography.heading3, { color: theme.colors.text }]}>Spending Trend</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {selectedPeriod === '3months' ? 'Weekly' : 'Daily'} breakdown
            </Text>
          </View>
          <View style={[styles.chartCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            {!font ? (
              <View style={styles.emptyChart}>
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>Loading chart…</Text>
              </View>
            ) : hasEnoughTrendData ? (
              <View style={{ height: 200, width: CHART_WIDTH }}>
                <CartesianChart
                  data={chartData}
                  xKey="x"
                  yKeys={['amount']}
                  axisOptions={{
                    font,
                    labelColor: theme.colors.textSecondary,
                    lineColor: theme.colors.border,
                    formatXLabel: (val: number) => chartLabels[val] !== undefined ? chartLabels[val] : '',
                    formatYLabel: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`,
                  }}
                >
                  {({ points, chartBounds }) => (
                    <Bar
                      points={points.amount}
                      chartBounds={chartBounds}
                      color={theme.colors.primary}
                      roundedCorners={{ topLeft: 4, topRight: 4 }}
                      barWidth={selectedPeriod === '3months' ? 10 : 6}
                    />
                  )}
                </CartesianChart>
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <BarChart2 size={32} color={theme.colors.neutral[300] as string} />
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 12 }]}>
                  Add more expense transactions{'\n'}to see your spending trend
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Category Breakdown Donut ── */}
        <Animated.View entering={FadeInUp.delay(280)}>
          <View style={styles.sectionHeader}>
            <Text style={[theme.typography.heading3, { color: theme.colors.text }]}>Category Breakdown</Text>
          </View>
          <View style={[styles.donutCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
            {hasExpenses ? (
              <View style={styles.donutLayout}>
                <View style={{ height: 160, width: 160 }}>
                  <PolarChart data={pieData} labelKey="label" valueKey="value" colorKey="color">
                    <Pie.Chart innerRadius={50} />
                  </PolarChart>
                </View>
                <ScrollView style={styles.donutLegend} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                  {breakdown.map(item => {
                    const cfg = getCategoryConfig(item.category);
                    return (
                      <View key={item.category} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: cfg.text }]} />
                        <Text style={[theme.typography.caption, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
                          {item.category}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 4 }]}>
                          {Math.round(item.percentage)}%
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <Target size={32} color={theme.colors.neutral[300] as string} />
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 12 }]}>
                  No expenses to show{'\n'}for this period
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Largest Expense Detail ── */}
        {largestExpense && largestExpenseCategoryConfig && (
          <Animated.View entering={FadeInUp.delay(360)}>
            <View style={styles.sectionHeader}>
              <Text style={[theme.typography.heading3, { color: theme.colors.text }]}>Single Largest Expense</Text>
            </View>
            <View style={[styles.largestCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
              <View style={styles.largestRow}>
                <View style={[styles.largestIcon, { backgroundColor: largestExpenseCategoryConfig.bg }]}>
                  <largestExpenseCategoryConfig.icon size={22} color={largestExpenseCategoryConfig.text} />
                </View>
                <View style={styles.largestTexts}>
                  <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]} numberOfLines={1}>
                    {largestExpense.notes || '(no notes)'}
                  </Text>
                  <View style={[styles.catPill, { backgroundColor: largestExpenseCategoryConfig.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                    <Text style={[theme.typography.caption, { color: largestExpenseCategoryConfig.text, fontWeight: '600' }]}>
                      {largestExpense.category}
                    </Text>
                  </View>
                </View>
                <Text style={[theme.typography.heading2, { color: theme.colors.expense }]}>
                  {formatCurrency(largestExpense.amount)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  periodBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 14,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10,
  },
  scrollContent: { paddingHorizontal: 20 },
  netCard: {
    borderRadius: 16, padding: 16, borderWidth: 1.5, marginBottom: 16,
  },
  netRow: { flexDirection: 'row', alignItems: 'center' },
  netIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  netChips: { flexDirection: 'row', gap: 16, marginTop: 12 },
  netChip: { flexDirection: 'row', alignItems: 'center' },
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  halfCard: {
    borderRadius: 16, padding: 14, flex: 1,
    justifyContent: 'flex-start',
  },
  chartCard: { borderRadius: 16, padding: 16, marginBottom: 24, alignItems: 'center' },
  donutCard: { borderRadius: 16, padding: 16, marginBottom: 24 },
  largestCard: { borderRadius: 16, padding: 16, marginBottom: 24 },
  twoColRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
  },
  iconBox: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  topCatRow: { flexDirection: 'row', alignItems: 'center' },
  topCatIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  topCatTexts: { flex: 1 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  wowValueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 6, marginBottom: 4,
  },
  catPill: {
    alignSelf: 'flex-start', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6, marginTop: 6,
  },
  emptyChart: {
    height: 160, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  donutLayout: { flexDirection: 'row', alignItems: 'center' },
  donutLegend: { flex: 1, marginLeft: 16, maxHeight: 160 },
  legendRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  legendDot: {
    width: 8, height: 8, borderRadius: 4, marginRight: 8, flexShrink: 0,
  },
  largestRow: { flexDirection: 'row', alignItems: 'center' },
  largestIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14, flexShrink: 0,
  },
  largestTexts: { flex: 1, marginRight: 12 },
});
