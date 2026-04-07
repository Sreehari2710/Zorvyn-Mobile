import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { Transaction } from '../models/transaction';
import { formatCurrency } from '../utils/currency';
import { formatShortDate } from '../utils/date';
import { getCategoryConfig } from '../utils/categories';
import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  /** Pass the list index for staggered animation */
  index?: number;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  index = 0,
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const config = getCategoryConfig(transaction.category);
  const Icon = config.icon;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/transaction/${transaction.id}`);
    }
  };

  // Staggered fade + slide up; instant when Reduce Motion is enabled
  const entering = reduceMotion
    ? undefined
    : FadeInUp.delay(index * 30).duration(250);

  return (
    <Animated.View entering={entering}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          pressed && { backgroundColor: theme.colors.neutral[100] as string },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
          <Icon size={20} color={config.text} />
        </View>

        <View style={styles.details}>
          <Text
            style={[theme.typography.heading3, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {transaction.category}
          </Text>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {transaction.notes ? `${transaction.notes} • ` : ''}
            {formatShortDate(transaction.date)}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text
            style={[
              theme.typography.heading3,
              {
                color:
                  transaction.type === 'income'
                    ? theme.colors.income
                    : theme.colors.expense,
              },
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  amountContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
});
