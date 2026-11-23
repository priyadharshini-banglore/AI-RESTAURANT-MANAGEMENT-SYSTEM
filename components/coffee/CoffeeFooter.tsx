import React from 'react';
import { Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

export const CoffeeFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#2D211B] text-[#F5F1E9] pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#B77A4B]" />
              <span className="font-black text-lg tracking-[0.2em] text-[#F5F1E9] uppercase">
                COFFEE CULTURE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#D8C8B4] font-light max-w-sm leading-relaxed">
              Artisanal single-origin coffee roasters and hospitality digital solutions. Crafted with
              passion, roasted weekly, brewed for unforgettable moments.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B77A4B] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B77A4B] text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B77A4B] text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#B77A4B]">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#D8C8B4]">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#story" className="hover:text-white transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Signature Collection
                </a>
              </li>
              <li>
                <a href="#brewing" className="hover:text-white transition-colors">
                  Brewing Guide
                </a>
              </li>
              <li>
                <a href="#journey" className="hover:text-white transition-colors">
                  3D Coffee Experience
                </a>
              </li>
            </ul>
          </div>

          {/* Business & Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#B77A4B]">
              Platform Solutions
            </h4>
            <ul className="space-y-2 text-xs text-[#D8C8B4]">
              <li>
                <a href="#demo-booking" className="hover:text-white transition-colors">
                  Book a Free Demo
                </a>
              </li>
              <li>
                <a href="#demo-booking" className="hover:text-white transition-colors">
                  Restaurant POS
                </a>
              </li>
              <li>
                <a href="#demo-booking" className="hover:text-white transition-colors">
                  Smart Digital Invoicing
                </a>
              </li>
              <li>
                <a href="#demo-booking" className="hover:text-white transition-colors">
                  Staff & Kitchen Portals
                </a>
              </li>
              <li>
                <a href="#demo-booking" className="hover:text-white transition-colors">
                  Wholesale Coffee Supply
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#B77A4B]">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D8C8B4]">
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#C87552] shrink-0" />
                <span>Indiranagar 100ft Rd, Bengaluru, KA</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-[#C87552] shrink-0" />
                <span>hello@coffeeculture.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#C87552] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D8C8B4]/70 gap-4">
          <p>© {new Date().getFullYear()} Coffee Culture Technologies Inc. All rights reserved.</p>

          <div className="flex items-center space-x-6">
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                alert('Privacy Policy: All customer and restaurant data is stored securely.');
              }}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                alert('Terms & Conditions: Service provided under standard SaaS terms.');
              }}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </a>

            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#2D211B] flex items-center justify-center transition-all cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
