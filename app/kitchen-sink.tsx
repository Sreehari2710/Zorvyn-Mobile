import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';
import { Tag } from '../components/Tag';
import { EmptyState } from '../components/EmptyState';
import { Toast } from '../components/Toast';
import { BottomSheet } from '../components/BottomSheet';
import { Icon } from '../components/Icon';
import { useToastStore } from '../store/toastStore';

export default function KitchenSink() {
  const { theme } = useTheme();
  const showToast = useToastStore((state) => state.show);
  const [inputValue, setInputValue] = useState('');
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.heading2 }]}>Buttons</Text>
        <View style={styles.row}>
          <Button label="Primary" onPress={() => {}} variant="primary" />
          <Button label="Secondary" onPress={() => {}} variant="secondary" style={styles.marginL} />
        </View>
        <View style={styles.row}>
          <Button label="Destructive" onPress={() => {}} variant="destructive" />
          <Button label="Outline" onPress={() => {}} variant="outline" style={styles.marginL} />
        </View>
        <View style={styles.row}>
          <Button label="Ghost" onPress={() => {}} variant="ghost" />
          <Button label="Loading" onPress={() => {}} loading />
        </View>
        <View style={styles.row}>
          <Button label="Link Variant" onPress={() => {}} variant="link" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.heading2 }]}>Inputs</Text>
        <Input 
          label="Standard Input" 
          placeholder="Type something..." 
          value={inputValue} 
          onChangeText={setInputValue} 
        />
        <Input 
          label="Error state" 
          placeholder="Error example" 
          value={inputValue} 
          onChangeText={setInputValue} 
          error="This is an error message"
        />
        <Input 
          label="With Icon" 
          placeholder="Search..." 
          value={inputValue} 
          onChangeText={setInputValue} 
          trailingIcon={<Icon name="Search" color={theme.colors.textSecondary} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.heading2 }]}>Cards & Tags</Text>
        <Card onPress={() => showToast('Card Pressed!', 'success')}>
          <Text style={{ color: theme.colors.text, ...theme.typography.body }}>This is a pressable card</Text>
          <View style={[styles.row, { marginTop: 12 }]}>
            <Tag label="Shopping" category="Shopping" />
            <Tag label="Active Filter" variant="filter" active style={styles.marginL} />
            <Tag label="Inactive" variant="filter" style={styles.marginL} />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.heading2 }]}>Progress</Text>
        <ProgressBar progress={35} />
        <View style={{ height: 12 }} />
        <ProgressBar progress={85} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.heading2 }]}>Feedback & Sheets</Text>
        <Button label="Show Success Toast" onPress={() => showToast('Operation Successful!', 'success')} style={styles.marginB} />
        <Button label="Show Error Toast" onPress={() => showToast('Something went wrong', 'error')} variant="destructive" style={styles.marginB} />
        <Button label="Open Bottom Sheet" onPress={() => setIsSheetVisible(true)} variant="secondary" />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.heading2 }]}>Empty States</Text>
        <EmptyState 
          heading="No Transactions" 
          subtext="You haven't added any expenses yet." 
          icon={<Icon name="FileQuestion" size={32} color={theme.colors.textSecondary} />}
          ctaLabel="Add Now"
          onCta={() => showToast('CTA Clicked!')}
        />
      </View>

      <BottomSheet isVisible={isSheetVisible} onClose={() => setIsSheetVisible(false)}>
        <View style={{ padding: 20 }}>
          <Text style={{ color: theme.colors.text, ...theme.typography.heading2 }}>Bottom Sheet Content</Text>
          <Text style={{ color: theme.colors.textSecondary, ...theme.typography.body, marginTop: 10 }}>
            This sheet is animated and can be dismissed by swiping down or tapping the backdrop.
          </Text>
          <Button label="Close" onPress={() => setIsSheetVisible(false)} style={{ marginTop: 20 }} />
        </View>
      </BottomSheet>
      
      <Toast />
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  marginL: {
    marginLeft: 12,
  },
  marginB: {
    marginBottom: 12,
  }
});
