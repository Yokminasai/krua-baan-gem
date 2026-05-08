"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Check } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";

export interface ProductOption {
  id: string;
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  required?: boolean;
  min?: number;
  max?: number;
  description?: string;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  optionGroups?: ProductOptionGroup[];
  category?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const { addItem } = useCartStore();

  useEffect(() => {
    if (product) {
      setQuantity(1);
      const initialOptions: Record<string, string[]> = {};
      product.optionGroups?.forEach(group => {
        initialOptions[group.id] = [];
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  if (!product || !isOpen) return null;

  const handleToggleOption = (groupId: string, optionId: string, max: number = 1) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      
      if (max === 1) {
        // Radio button behavior
        return { ...prev, [groupId]: isSelected ? [] : [optionId] };
      } else {
        // Checkbox behavior
        if (isSelected) {
          return { ...prev, [groupId]: current.filter(id => id !== optionId) };
        } else if (current.length < max) {
          return { ...prev, [groupId]: [...current, optionId] };
        }
        return prev;
      }
    });
  };

  const calculateTotal = () => {
    let extraPrice = 0;
    product.optionGroups?.forEach(group => {
      const selectedIds = selectedOptions[group.id] || [];
      selectedIds.forEach(id => {
        const option = group.options.find(o => o.id === id);
        if (option) extraPrice += option.price;
      });
    });
    return (product.price + extraPrice) * quantity;
  };

  const isFormValid = () => {
    return product.optionGroups?.every(group => {
      if (!group.required) return true;
      const selectedCount = (selectedOptions[group.id] || []).length;
      const min = group.min || (group.required ? 1 : 0);
      return selectedCount >= min;
    }) ?? true;
  };

  const handleAddToCart = () => {
    if (!isFormValid()) return;

    // Build the selection description for the cart
    const selections = product.optionGroups?.map(group => {
      const selectedNames = (selectedOptions[group.id] || [])
        .map(id => group.options.find(o => o.id === id)?.name)
        .filter(Boolean);
      return selectedNames.length > 0 ? `${group.name}: ${selectedNames.join(', ')}` : null;
    }).filter(Boolean).join(' | ');

    addItem({
      id: product.id,
      name: product.name,
      price: calculateTotal() / quantity,
      image: product.image,
      quantity: quantity,
      description: selections || product.description
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col">
        {/* Header Image */}
        <div className="relative h-64 shrink-0 overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-32">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-3xl font-serif font-bold text-deep-charcoal">{product.name}</h2>
              <span className="text-2xl font-black text-mala-600">฿{product.price}</span>
            </div>
            <p className="text-gray-500 font-light leading-relaxed">{product.description}</p>
          </div>

          {/* Option Groups */}
          {product.optionGroups?.map((group) => (
            <div key={group.id} className="space-y-6">
              <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-deep-charcoal">{group.name}</h3>
                  {group.description && <p className="text-xs text-mala-500 mt-1 font-medium">{group.description}</p>}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 rounded-full text-gray-400">
                  {group.required ? (group.min ? `เลือกขั้นต่ำ ${group.min}` : 'ต้องเลือก') : 'ไม่บังคับ'}
                  {group.max && group.max > 1 && ` (สูงสุด ${group.max})`}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {group.options.map((option) => {
                  const isSelected = selectedOptions[group.id]?.includes(option.id);
                  const isOutOfStock = option.isAvailable === false;

                  return (
                    <button
                      key={option.id}
                      disabled={isOutOfStock}
                      onClick={() => handleToggleOption(group.id, option.id, group.max || 1)}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left ${
                        isSelected 
                          ? "border-mala-600 bg-mala-50/50" 
                          : "border-gray-50 bg-gray-50 hover:border-gray-200"
                      } ${isOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected ? "bg-mala-600 border-mala-600 text-white" : "border-gray-300"
                        }`}>
                          {isSelected && <Check className="w-4 h-4 stroke-[4]" />}
                        </div>
                        <span className="font-bold text-deep-charcoal">{option.name}</span>
                        {isOutOfStock && <span className="text-[10px] font-black text-red-500 uppercase ml-2">หมดชั่วคราว</span>}
                      </div>
                      {option.price > 0 && (
                        <span className="text-sm font-black text-mala-600">+ ฿{option.price}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deep-charcoal border-b border-gray-100 pb-4">คำแนะนำพิเศษ</h3>
            <textarea 
              placeholder="เช่น ไม่ใส่ผัก, ขอเผ็ดน้อยๆ..."
              className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-5 text-gray-700 focus:border-mala-600 focus:bg-white transition-all outline-none resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 p-6 flex items-center gap-6">
          <div className="flex items-center bg-gray-100 rounded-2xl p-1">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 flex items-center justify-center text-deep-charcoal hover:bg-white rounded-xl transition-all"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-12 text-center font-black text-lg">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 flex items-center justify-center text-deep-charcoal hover:bg-white rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            disabled={!isFormValid()}
            onClick={handleAddToCart}
            className={`flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
              isFormValid() 
                ? "bg-mala-600 text-white shadow-mala-600/20 hover:bg-mala-700" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            ใส่ตะกร้า — ฿{calculateTotal().toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
