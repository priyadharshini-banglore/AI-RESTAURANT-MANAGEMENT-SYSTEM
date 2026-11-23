import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MenuItem } from '../types';

interface MenuManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuManagerModal: React.FC<MenuManagerModalProps> = ({ isOpen, onClose }) => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAppContext();
  
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [customCategory, setCustomCategory] = useState('');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    const standardCategories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];
    if (standardCategories.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(item.category);
    }
  };

  const handleResetForm = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setCategory('Main Course');
    setCustomCategory('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    
    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'Special') : category;
    const numPrice = parseFloat(price) || 0;

    if (editingItem) {
      updateMenuItem({
        id: editingItem.id,
        name: name.trim(),
        price: numPrice,
        category: finalCategory,
      });
    } else {
      addMenuItem({
        name: name.trim(),
        price: numPrice,
        category: finalCategory,
      });
    }
    handleResetForm();
  };

  const filteredItems = menuItems.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0F172A]/95 border-2 border-indigo-500/80 rounded-3xl shadow-[0_0_70px_-15px_rgba(99,102,241,0.5)] w-full max-w-4xl text-left p-6 sm:p-8 overflow-y-auto max-h-[92vh] grid grid-cols-1 md:grid-cols-12 gap-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-pink-500" />

        {/* Left/Top: Form to Add or Edit */}
        <div className="md:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-lg font-black text-white">
              {editingItem ? '✏️ Edit Dish' : '➕ Add New Dish'}
            </h3>
            {editingItem && (
              <button 
                onClick={handleResetForm}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-bold"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Dish Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Butter Chicken Masala"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Price (₹ Rupees):
              </label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 320"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono font-extrabold text-emerald-400 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Category:
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="Appetizer">Appetizer</option>
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
                <option value="Custom">+ Custom Category</option>
              </select>
            </div>

            {category === 'Custom' && (
              <div className="animate-fade-in">
                <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Custom Category Name:
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="e.g. Tandoori Specials / Combo"
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95"
            >
              {editingItem ? '✅ Update Dish & Sync' : '🚀 Save Dish & Sync Live'}
            </button>
          </form>
        </div>

        {/* Right/Bottom: Current Menu Items Table */}
        <div className="md:col-span-7 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-white">Live Menu Items ({menuItems.length})</h3>
              <p className="text-xs text-slate-400">Edits sync across all KDS & customer QR menus immediately.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search dish by name or category..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-2.5 pr-1">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                className="p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{item.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400 block mt-0.5">
                    ₹{item.price}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-colors"
                    title="Edit Dish"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${item.name}? This will remove it from the live menu.`)) {
                        deleteMenuItem(item.id);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 hover:text-rose-300 font-bold text-xs border border-slate-700 hover:border-rose-800 transition-colors"
                    title="Delete Dish"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-xs font-bold text-slate-500">
                No menu items found matching search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
