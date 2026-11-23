import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoffeeNavbar } from '../components/coffee/CoffeeNavbar';
import { CoffeeHero } from '../components/coffee/CoffeeHero';
import { CoffeeStoryIntro } from '../components/coffee/CoffeeStoryIntro';
import { CoffeeJourneyStory } from '../components/coffee/CoffeeJourneyStory';
import { CoffeeCollection, CoffeeProduct } from '../components/coffee/CoffeeCollection';
import { CoffeeCartDrawer, CartLineItem } from '../components/coffee/CoffeeCartDrawer';
import { CoffeeBrewingGuide } from '../components/coffee/CoffeeBrewingGuide';
import { CoffeeFeatures } from '../components/coffee/CoffeeFeatures';
import { CoffeeStatistics } from '../components/coffee/CoffeeStatistics';
import { CoffeeTestimonials } from '../components/coffee/CoffeeTestimonials';
import { CoffeeFinalCTA } from '../components/coffee/CoffeeFinalCTA';
import { CoffeeDemoBooking } from '../components/coffee/CoffeeDemoBooking';
import { CoffeeFooter } from '../components/coffee/CoffeeFooter';

export const CoffeeCultureLanding: React.FC = () => {
  const navigate = useNavigate();

  // Cart State for Signature Coffee purchases
  const [cartItems, setCartItems] = useState<CartLineItem[]>([
    {
      product: {
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
          'Our iconic Italian-style espresso blend. Velvety body, punchy crema, and rich cocoa undertones.',
      },
      quantity: 1,
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (product: CoffeeProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartLineItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleProceedToCheckout = () => {
    const el = document.getElementById('demo-booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDemoBooking = () => {
    const el = document.getElementById('demo-booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // When a restaurant customer is approved by developer, navigate into the restaurant portal
  const handleLaunchApprovedRestaurant = () => {
    navigate('/restaurant');
  };

  return (
    <div className="min-h-screen bg-[#F5F1E9] text-[#2D211B] font-sans relative selection:bg-[#B77A4B] selection:text-white overflow-x-hidden">
      {/* 1. Minimal Sticky Navigation Bar */}
      <CoffeeNavbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenDemo={handleOpenDemoBooking}
      />

      {/* 2. Hero Section — Immersive 3D Experience (Grinder + Floating Beans) */}
      <CoffeeHero
        onExploreCollection={() => {
          const el = document.getElementById('collection');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onDiscoverStory={() => {
          const el = document.getElementById('story');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. Introduction — Our Coffee Story */}
      <CoffeeStoryIntro
        onExploreMore={() => {
          const el = document.getElementById('journey');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 4. 3D Coffee Journey — Scroll Storytelling (5 Scenes) */}
      <CoffeeJourneyStory />

      {/* 5. Our Signature Collection (4 Roasts) */}
      <CoffeeCollection
        onAddToCart={handleAddToCart}
        onExploreProduct={() => setIsCartOpen(true)}
      />

      {/* 6. Interactive Brewing Section (Pour-over station & calculator) */}
      <CoffeeBrewingGuide />

      {/* 7. Why Choose Us Section (Crafted with Purpose) */}
      <CoffeeFeatures />

      {/* 8. Brand Experience / Statistics (100% Quality, 25+ Origins, etc.) */}
      <CoffeeStatistics />

      {/* 9. Customer Testimonials */}
      <CoffeeTestimonials />

      {/* 10. Final Brand Call to Action (with 3D Cup) */}
      <CoffeeFinalCTA onConnectClick={handleOpenDemoBooking} />

      {/* 11. Final Section — Book a Free Demo (Matching Attached Screenshot) */}
      <CoffeeDemoBooking onApprovedLaunch={handleLaunchApprovedRestaurant} />

      {/* 12. Footer */}
      <CoffeeFooter />

      {/* 13. Shopping Bag Slide-Over Drawer */}
      <CoffeeCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
};
export default CoffeeCultureLanding;

