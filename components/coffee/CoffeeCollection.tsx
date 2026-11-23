import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Check } from 'lucide-react';

export interface CoffeeProduct {
  id: string;
  name: string;
  tagline: string;
  roastLevel: 'Light' | 'Medium' | 'Medium-Dark' | 'Dark';
  notes: string[];
  price: number;
  weight: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
}

export const SIGNATURE_COFFEE_PRODUCTS: CoffeeProduct[] = [
  {
    id: 'prod-espresso',
    name: 'Classic Espresso',
    tagline: 'Rich, bold and intense.',
    roastLevel: 'Medium-Dark',
    notes: ['Dark Chocolate', 'Molasses', 'Toasted Hazelnut'],
    price: 499,
    weight: '250g Whole Bean',
    rating: 4.9,
    reviews: 428,
    image: '/images/coffee_bag_espresso.jpg',
    description:
      'Our iconic Italian-style espresso blend. Velvety body, punchy crema, and rich cocoa undertones crafted to cut effortlessly through whole milk or shine as a clean double-ristretto.',
  },
  {
    id: 'prod-caramel',
    name: 'Caramel Blend',
    tagline: 'Smooth, sweet and balanced.',
    roastLevel: 'Medium',
    notes: ['Salted Butter', 'Brown Sugar', 'Vanilla Pod'],
    price: 549,
    weight: '250g Whole Bean',
    rating: 4.9,
    reviews: 310,
    image: '/images/coffee_bag_caramel.jpg',
    description:
      'A crowd favorite naturally processed micro-lot. Notes of warm toffee and Madagascar vanilla with silky sweetness and zero bitterness. Perfect for pour-over and daily drip coffee.',
  },
  {
    id: 'prod-midnight',
    name: 'Midnight Roast',
    tagline: 'Deep, dark and aromatic.',
    roastLevel: 'Dark',
    notes: ['Smoked Oak', 'Black Truffle', 'Cacao Nibs'],
    price: 599,
    weight: '250g Whole Bean',
    rating: 4.8,
    reviews: 285,
    image: '/images/coffee_bag_dark.jpg',
    description:
      'Slow roasted under intense low heat into deep mahogany. Full-bodied with robust aromas and clean lingering finish for lovers of intense, smoky, traditional south Indian & French roasts.',
  },
  {
    id: 'prod-bliss',
    name: 'Morning Bliss',
    tagline: 'Light, fresh and refreshing.',
    roastLevel: 'Light',
    notes: ['Meyer Lemon', 'Jasmine Blossom', 'Wild Honey'],
    price: 479,
    weight: '250g Whole Bean',
    rating: 4.9,
    reviews: 196,
    image: '/images/coffee_bag_light.jpg',
    description:
      'High-elevation washed Ethiopian & Coorg harvest with bright citrus sparkle and delicate floral jasmine aroma. The quintessential crisp morning awakening cup.',
  },
];

interface CoffeeCollectionProps {
  onAddToCart: (product: CoffeeProduct) => void;
  onExploreProduct?: (product: CoffeeProduct) => void;
}

export const CoffeeCollection: React.FC<CoffeeCollectionProps> = ({
  onAddToCart,
  onExploreProduct,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<CoffeeProduct | null>(null);
  const [addedIds, setAddedIds] = useState<{ [id: string]: boolean }>({});

  const handleAdd = (prod: CoffeeProduct) => {
    onAddToCart(prod);
    setAddedIds((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prod.id]: false }));
    }, 1500);
  };

  return (
    <section id="collection" className="py-24 sm:py-32 bg-[#F5F1E9] text-[#2D211B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-[#C87552] text-xs uppercase tracking-[0.25em] font-bold mb-3">
              <span className="w-6 h-[2px] bg-[#C87552]" />
              <span>Small Batch Artisanal Harvest</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2D211B]">
              FIND YOUR PERFECT BREW.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#593A2C] font-light max-w-md">
            Four carefully curated flavor profiles roasted fresh every Monday. Available as whole
            beans or custom ground for your setup.
          </p>
        </div>

        {/* 4-Card Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SIGNATURE_COFFEE_PRODUCTS.map((product) => {
            const isJustAdded = addedIds[product.id];
            return (
              <div
                key={product.id}
                className="group bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#2D211B]/10 flex flex-col justify-between hover:-translate-y-2 relative"
              >
                {/* Image Container with 3D hover scale */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#EAE2D5]/50 mb-5 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 filter contrast-105"
                  />
                  
                  {/* Floating Roast Pill */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#2D211B]/85 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#F5F1E9]">
                    {product.roastLevel} Roast
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#2D211B] flex items-center space-x-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{product.rating}</span>
                  </div>

                  {/* Hover Quick View Trigger */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        onExploreProduct?.(product);
                      }}
                      className="px-4 py-2 rounded-full bg-white text-[#2D211B] font-bold text-xs tracking-wider uppercase flex items-center space-x-2 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Explore Notes</span>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#2D211B] tracking-tight group-hover:text-[#B77A4B] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#593A2C] font-semibold mt-0.5">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Tasting Notes Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.notes.map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#F5F1E9] text-[#593A2C] font-medium border border-[#2D211B]/10"
                      >
                        {note}
                      </span>
                    ))}
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 border-t border-[#2D211B]/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">{product.weight}</span>
                      <span className="text-xl font-black text-[#2D211B]">₹{product.price}</span>
                    </div>

                    <button
                      onClick={() => handleAdd(product)}
                      className={`px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 cursor-pointer shadow-md ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white shadow-emerald-200'
                          : 'bg-[#2D211B] hover:bg-[#593A2C] text-[#F5F1E9] hover:shadow-lg active:scale-95'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#B77A4B]" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick View / Tasting Notes Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#F5F1E9] rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#2D211B] shadow-2xl space-y-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#EAE2D5] hover:bg-[#D8C8B4] flex items-center justify-center text-[#2D211B] font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center space-x-4">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-20 h-24 object-cover rounded-xl shadow-md border"
              />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B77A4B]">
                  {selectedProduct.roastLevel} Roast
                </span>
                <h3 className="text-2xl font-extrabold text-[#2D211B]">{selectedProduct.name}</h3>
                <p className="text-xs text-[#593A2C] font-semibold">{selectedProduct.tagline}</p>
                <p className="text-lg font-black text-[#2D211B] mt-1">₹{selectedProduct.price}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#593A2C]">
                Tasting Notes & Profile
              </h4>
              <p className="text-sm text-[#593A2C] leading-relaxed font-light">
                {selectedProduct.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#593A2C]">
                Identified Flavors
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.notes.map((n, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-[#EAE2D5] text-[#2D211B] text-xs font-bold"
                  >
                    ✦ {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#2D211B]/15 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-[#593A2C] hover:text-[#2D211B] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAdd(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="px-6 py-2.5 rounded-full bg-[#2D211B] hover:bg-[#593A2C] text-[#F5F1E9] text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Add to Cart (₹{selectedProduct.price})
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

