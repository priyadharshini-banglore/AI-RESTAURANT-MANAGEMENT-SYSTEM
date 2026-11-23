import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';

interface PetpoojaNavbarProps {
  onBookDemoClick: () => void;
  onExploreSystemClick: () => void;
}

export const PetpoojaNavbar: React.FC<PetpoojaNavbarProps> = ({
  onBookDemoClick,
  onExploreSystemClick,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#0D1624]/95 backdrop-blur-md shadow-md border-b border-slate-800 py-3.5'
          : 'bg-[#0D1624] py-4 sm:py-5 border-b border-slate-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          
          {/* 1. Left: Brand Logo (Restro Typography matching Petpooja Theme) */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-1.5 group cursor-pointer text-decoration-none select-none"
          >
            <div className="flex items-center text-[22px] sm:text-[26px] font-black tracking-tight text-white">
              <span>REST</span>
              <span className="text-[#E22637]">RO</span>
            </div>
          </a>

          {/* 2. Center: Petpooja Navigation Items */}
          <nav className="hidden md:flex items-center space-x-7 xl:space-x-8 text-[14.5px] font-medium text-slate-300">
            <a
              href="#products"
              onClick={(e) => handleNavClick(e, 'products')}
              className="hover:text-white transition-colors flex items-center space-x-1 py-1"
            >
              <span>Products</span>
              <span className="text-[#E22637] text-xs font-bold">+</span>
            </a>

            <a
              href="#about-us"
              onClick={(e) => handleNavClick(e, 'about-us')}
              className="hover:text-white transition-colors py-1"
            >
              About Us
            </a>

            <a
              href="#metrics"
              onClick={(e) => handleNavClick(e, 'metrics')}
              className="hover:text-white transition-colors py-1"
            >
              Careers
            </a>

            <a
              href="#solutions"
              onClick={(e) => handleNavClick(e, 'solutions')}
              className="hover:text-white transition-colors flex items-center space-x-1 py-1"
            >
              <span>Resources</span>
              <span className="text-[#E22637] text-xs font-bold">+</span>
            </a>
          </nav>

          {/* 3. Right: "Get Started" Red Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onExploreSystemClick}
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            >
              <span>Explore POS</span>
            </button>

            <button
              onClick={onBookDemoClick}
              className="px-5 sm:px-6 py-2.5 rounded-lg bg-[#E22637] hover:bg-[#C82032] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Get Started
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D1624] border-b border-slate-800 px-5 pt-3 pb-6 shadow-2xl space-y-3">
          <div className="flex flex-col space-y-3 font-medium text-slate-300 text-sm">
            <a
              href="#products"
              onClick={(e) => handleNavClick(e, 'products')}
              className="py-1 hover:text-white flex items-center justify-between"
            >
              <span>Products</span>
              <span className="text-[#E22637] font-bold">+</span>
            </a>
            <a
              href="#about-us"
              onClick={(e) => handleNavClick(e, 'about-us')}
              className="py-1 hover:text-white"
            >
              About Us
            </a>
            <a
              href="#metrics"
              onClick={(e) => handleNavClick(e, 'metrics')}
              className="py-1 hover:text-white"
            >
              Careers
            </a>
            <a
              href="#solutions"
              onClick={(e) => handleNavClick(e, 'solutions')}
              className="py-1 hover:text-white flex items-center justify-between"
            >
              <span>Resources</span>
              <span className="text-[#E22637] font-bold">+</span>
            </a>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookDemoClick();
              }}
              className="w-full py-2.5 rounded-lg bg-[#E22637] text-white font-bold text-xs uppercase tracking-wider text-center"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onExploreSystemClick();
              }}
              className="w-full py-2.5 rounded-lg bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider text-center"
            >
              Live Restaurant POS Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
