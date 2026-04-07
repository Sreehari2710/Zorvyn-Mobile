import { categoryConfig } from '../theme/tokens';

export const CATEGORIES = Object.keys(categoryConfig);

export const getCategoryConfig = (category: string) => {
  return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig['Other'];
};

export { categoryConfig };
