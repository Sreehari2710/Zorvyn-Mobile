import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { LucideProps } from 'lucide-react-native';

export type IconName = keyof typeof LucideIcons;

interface IconProps extends LucideProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  color, 
  ...props 
}) => {
  const LucideIcon = LucideIcons[name] as React.FC<LucideProps>;

  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon 
      size={size} 
      color={color} 
      strokeWidth={1.5} 
      {...props} 
    />
  );
};
