import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, ScrollView } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { useTheme } from '@theme/ThemeProvider';
import { useTransactionStore } from '../../store/transactionStore';
import { useToastStore } from '../../store/toastStore';
import { TransactionItem } from '../../components/TransactionItem';
import { Input } from '../../components/Input';
import { Tag } from '../../components/Tag';
import { EmptyState } from '../../components/EmptyState';
import { FAB } from '../../components/FAB';
import { groupTransactionsByDate } from '../../utils/calculations';
import { Icon } from '../../components/Icon';

const CATEGORIES = [
  'All',
  'Shopping',
  'Food',
  'Transport',
  'Rent',
  'Salary',
  'Entertainment',
  'Health',
  'Utilities',
  'Other'
];

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const { transactions, searchQuery, setSearchQuery, deleteTransaction } = useTransactionStore();
  const { show } = useToastStore();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const notes = t.notes || '';
      const matchesSearch = notes.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategory]);

  const groupedTransactions = useMemo(() => 
    groupTransactionsByDate(filteredTransactions), 
  [filteredTransactions]);

  const hasFilters = searchQuery !== '' || selectedCategory !== 'All';

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    show('Transaction deleted successfully', 'success');
  };

  const renderRightActions = (id: string) => (
    <RectButton
      style={[styles.deleteAction, { backgroundColor: theme.colors.expense }]}
      onPress={() => handleDelete(id)}
    >
      <Trash2 color="white" size={24} />
      <Text style={[theme.typography.caption, { color: 'white', fontWeight: 'bold', marginTop: 4 }]}>
        Delete
      </Text>
    </RectButton>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[theme.typography.heading1, { color: theme.colors.text }]}>History</Text>
        
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notes or category..."
            leftIcon={<Icon name="Search" size={18} color={theme.colors.textSecondary} />}
          />
        </View>

        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map(cat => (
              <Tag
                key={cat}
                label={cat}
                variant="filter"
                active={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
                style={styles.categoryTag}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <SectionList
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item.id)}
            friction={2}
            rightThreshold={40}
          >
            <View style={[styles.itemWrapper, { backgroundColor: theme.colors.background }]}>
              <TransactionItem transaction={item} index={index} />
            </View>
          </Swipeable>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
            <Text style={[theme.typography.overline, { color: theme.colors.textSecondary }]}>
              {title}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={<Icon name="Search" size={32} color={theme.colors.neutral[300] as string} />}
              heading="No transactions found"
              subtext={hasFilters ? "Try adjusting your search or filters" : "Your financial history will appear here"}
              ctaLabel={hasFilters ? "Clear All Filters" : undefined}
              onCta={() => {
                if (hasFilters) {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }
              }}
            />
          </View>
        }
      />

      <FAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 8,
  },
  searchContainer: {
    marginTop: 16,
  },
  filterContainer: {
    marginTop: 16,
    marginHorizontal: -20, // Negative margin to allow internal scroll padding
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryTag: {
    marginRight: 0,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  itemWrapper: {
    paddingHorizontal: 20,
  },
  deleteAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 60,
  }
});

