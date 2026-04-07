import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  show: (message: string, type?: 'success' | 'error') => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'success',
  show: (message, type = 'success') => {
    set({ message, type, visible: true });
    // Auto-hide handled by component or caller, 
    // but usually easier to handle in the component's useEffect
  },
  hide: () => set({ visible: false }),
}));
