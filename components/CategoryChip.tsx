import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { getCategoryConfig } from '../utils/categories';

interface CategoryChipProps {
  category: string;
  active?: boolean;
  onPress?: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ category, active, onPress }) => {
  const { theme } = useTheme();
  const config = getCategoryConfig(category);

  return (
    <Pressable 
      onPress={onPress}
      style={[
        styles.chip, 
        { 
          backgroundColor: config.bg,
          borderWidth: 2,
          borderColor: active ? theme.colors.primary : 'transparent',
        }
      ]}
    >
      <Text style={[
        styles.text, 
        { color: config.text, ...theme.typography.caption, fontWeight: '600' }
      ]}>
        {category.toUpperCase()}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
  },
});
