import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Check, Flame } from 'lucide-react-native';
import { startOfWeek, addDays, format, isSameDay, isAfter, startOfToday, parseISO } from 'date-fns';

interface StreakStripProps {
  streakDates: string[]; // Array of logged ISO date strings YYYY-MM-DD
}

export const StreakStrip = ({ streakDates }: StreakStripProps) => {
  const { theme } = useTheme();
  const today = startOfToday();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dateSet = new Set(streakDates);

  return (
    <View style={styles.container}>
      {days.map((day, index) => {
        const isTodayDay = isSameDay(day, today);
        const dayStr = format(day, 'yyyy-MM-dd');
        const isLogged = dateSet.has(dayStr);
        const isFuture = isAfter(day, today);

        return (
          <View key={index} style={styles.dayCol}>
            <Text
              style={[
                theme.typography.caption,
                {
                  color: isTodayDay ? theme.colors.primary : theme.colors.textSecondary,
                  fontWeight: isTodayDay ? '700' : '400',
                  marginBottom: 6,
                },
              ]}
            >
              {format(day, 'E')[0]}
            </Text>
            <View
              style={[
                styles.box,
                {
                  backgroundColor: isLogged
                    ? theme.colors.primary
                    : isFuture
                    ? theme.colors.neutral[100] as string
                    : theme.colors.neutral[100] as string,
                  borderColor: isTodayDay && !isLogged ? theme.colors.primary : 'transparent',
                  borderWidth: isTodayDay && !isLogged ? 2 : 0,
                  opacity: isFuture ? 0.4 : 1,
                },
              ]}
            >
              {isLogged && (
                <Check size={14} color="#fff" strokeWidth={3} />
              )}
              {isTodayDay && !isLogged && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.colors.primary,
                  }}
                />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayCol: {
    alignItems: 'center',
  },
  box: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
