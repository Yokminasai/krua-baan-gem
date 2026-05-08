import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options?: string;
  optionDetails?: any[]; // Store detailed options for order processing
  image?: string;
  description?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (uniqueKey: string) => void;
  updateQuantity: (uniqueKey: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Generate a unique key for items with same ID but different options
const getItemKey = (item: CartItem) => `${item.id}-${item.options || ''}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const itemKey = getItemKey(newItem);
        const existingItemIndex = state.items.findIndex(item => getItemKey(item) === itemKey);
        
        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += newItem.quantity;
          return { items: newItems };
        }
        return { items: [...state.items, newItem] };
      }),
      
      removeItem: (uniqueKey) => set((state) => ({
        items: state.items.filter(item => getItemKey(item) !== uniqueKey)
      })),
      
      updateQuantity: (uniqueKey, quantity) => set((state) => ({
        items: state.items.map(item => 
          getItemKey(item) === uniqueKey ? { ...item, quantity } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'krua-baan-gem-cart',
    }
  )
);
