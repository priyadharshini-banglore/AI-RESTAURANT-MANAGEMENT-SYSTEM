import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';

interface CoffeeNavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenDemo: () => void;
}

export const CoffeeNavbar: React.FC<CoffeeNavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenDemo,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F5F1E9]/90 backdrop-blur-md border-b border-[#2D211B]/10 py-3.5 shadow-sm'
            : 'bg-transparent py-5 sm:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('hero');
            }}
            className="group flex items-center space-x-2 text-decoration-none"
          >
            <span className="w-3 h-3 rounded-full bg-[#B77A4B] inline-block transition-transform duration-300 group-hover:scale-125" />
            <span className="font-extrabold tracking-[0.2em] text-sm sm:text-base text-[#2D211B] uppercase">
              COFFEE CULTURE
            </span>
          </a>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Our Story', id: 'story' },
              { label: 'Collection', id: 'collection' },
              { label: 'Brewing', id: 'brewing' },
              { label: 'Experience', id: 'journey' },
              { label: 'Contact', id: 'demo-booking' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-xs tracking-wider uppercase font-medium text-[#2D211B]/80 hover:text-[#B77A4B] transition-colors relative py-1 group cursor-pointer"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B77A4B] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => scrollTo('collection')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-[#593A2C]/20 bg-[#593A2C] text-[#F5F1E9] text-xs font-semibold uppercase tracking-wider hover:bg-[#2D211B] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Shopping Bag Icon with Cart Badge */}
            <button
              onClick={onOpenCart}
              aria-label="Shopping bag"
              className="relative p-2.5 rounded-full bg-[#EAE2D5]/70 hover:bg-[#EAE2D5] text-[#2D211B] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C87552] text-white text-[10px] font-bold flex items-center justify-center animate-scale-up">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-[#2D211B] hover:bg-[#EAE2D5] transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#F5F1E9] border-b border-[#2D211B]/10 px-6 py-6 space-y-4 animate-fade-in shadow-lg">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Our Story', id: 'story' },
              { label: 'Collection', id: 'collection' },
              { label: 'Brewing', id: 'brewing' },
              { label: 'Coffee Journey', id: 'journey' },
              { label: 'Book Demo / Contact', id: 'demo-booking' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full text-left text-sm uppercase tracking-wider font-semibold text-[#2D211B] hover:text-[#B77A4B] py-2 border-b border-[#2D211B]/5"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollTo('collection');
                }}
                className="w-full py-3 rounded-full bg-[#593A2C] text-[#F5F1E9] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDemo();
                }}
                className="w-full py-2.5 rounded-full border border-[#C82032] text-[#C82032] hover:bg-[#C82032] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Book a Free Demo
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

