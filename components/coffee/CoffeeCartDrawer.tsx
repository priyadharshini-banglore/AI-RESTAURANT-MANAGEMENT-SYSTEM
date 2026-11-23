import React from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { CoffeeProduct } from './CoffeeCollection';

export interface CartLineItem {
  product: CoffeeProduct;
  quantity: number;
}

interface CoffeeCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartLineItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CoffeeCartDrawer: React.FC<CoffeeCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const grandTotal = subtotal + delivery;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F5F1E9] text-[#2D211B] shadow-2xl flex flex-col justify-between border-l border-[#2D211B]/15">
          {/* Header */}
          <div className="p-6 border-b border-[#2D211B]/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-[#B77A4B]" />
              <h2 className="font-extrabold text-lg uppercase tracking-wider text-[#2D211B]">
                Your Coffee Bag
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#EAE2D5] text-xs font-bold text-[#593A2C]">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#EAE2D5] text-[#593A2C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#EAE2D5] text-[#593A2C] flex items-center justify-center mx-auto text-2xl">
                  ☕
                </div>
                <h3 className="font-bold text-base text-[#2D211B]">Your bag is currently empty</h3>
                <p className="text-xs text-[#593A2C] max-w-xs mx-auto">
                  Explore our Signature Collection to find fresh roasts for your daily ritual.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#2D211B]/10 flex items-center space-x-4"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-18 object-cover rounded-xl border"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-[#2D211B] truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-[#B77A4B] font-semibold">{item.product.weight}</p>
                    <p className="font-black text-sm text-[#2D211B] mt-1">₹{item.product.price}</p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-2 bg-[#F5F1E9] rounded-xl p-1 border border-[#2D211B]/10">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="p-1 rounded-lg hover:bg-[#EAE2D5] text-[#2D211B] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="p-1 rounded-lg hover:bg-[#EAE2D5] text-[#2D211B] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#2D211B]/10 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-[#593A2C]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#2D211B]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Artisan Express Shipping</span>
                  <span className="font-bold text-[#2D211B]">
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#2D211B] pt-2 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onProceedToCheckout();
                  onClose();
                }}
                className="w-full py-3.5 rounded-full bg-[#2D211B] hover:bg-[#593A2C] text-[#F5F1E9] font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#B77A4B]" />
              </button>

              <p className="text-[10px] text-center text-slate-400">
                🔒 Secure UPI & Card checkout • Roasted & packed fresh on order
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

