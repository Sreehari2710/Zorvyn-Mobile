import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { Home, List, Target, BarChart2, Plus } from 'lucide-react-native';
import { View, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          ...theme.typography.heading2,
          color: theme.colors.text,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          // @ts-ignore
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarLabel: 'History',
          // @ts-ignore
          tabBarIcon: ({ color }) => <List size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarLabel: 'Target',
          // @ts-ignore
          tabBarIcon: ({ color }) => <Target size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarLabel: 'Stats',
          // @ts-ignore
          tabBarIcon: ({ color }) => <BarChart2 size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
