import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../models/transaction';
import { format } from 'date-fns';
import { Platform } from 'react-native';

function escapeCsv(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportTransactionsToCSV(transactions: Transaction[]): Promise<void> {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const header = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
  const rows = sorted.map((t) => [
    format(new Date(t.date), 'yyyy-MM-dd'),
    t.type,
    t.category,
    t.amount.toString(),
    t.notes || '',
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  const fileName = `zorvyn_transactions_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }

  const shareOptions: Parameters<typeof Sharing.shareAsync>[1] = {
    mimeType: 'text/csv',
    dialogTitle: 'Export Transactions',
  };

  // UTI is iOS-only
  if (Platform.OS === 'ios') {
    shareOptions.UTI = 'public.comma-separated-values-text';
  }

  await Sharing.shareAsync(filePath, shareOptions);
}
