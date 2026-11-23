import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetpoojaNavbar } from '../components/landing/PetpoojaNavbar';
import { PetpoojaHero } from '../components/landing/PetpoojaHero';
import { PetpoojaBrands } from '../components/landing/PetpoojaBrands';
import { PetpoojaPillars } from '../components/landing/PetpoojaPillars';
import { PetpoojaEcosystem } from '../components/landing/PetpoojaEcosystem';
import { PetpoojaOutlets } from '../components/landing/PetpoojaOutlets';
import { PetpoojaTestimonials } from '../components/landing/PetpoojaTestimonials';
import { PetpoojaDemoForm } from '../components/landing/PetpoojaDemoForm';
import { PetpoojaFooter } from '../components/landing/PetpoojaFooter';
import { ScrollProgressBar } from '../components/landing/Scroll3DAnimation';

export const PetpoojaLanding: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProductForDemo, setSelectedProductForDemo] = useState<string>('Restaurant POS');

  const scrollToDemo = () => {
    const el = document.getElementById('demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchLiveSystem = () => {
    navigate('/restaurant');
  };

  return (
    <div id="top" className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#E22637] selection:text-white relative">
      {/* 0. 3D Scroll Reading Progress Indicator */}
      <ScrollProgressBar />

      {/* 1. Navbar */}
      <PetpoojaNavbar
        onBookDemoClick={scrollToDemo}
        onExploreSystemClick={handleLaunchLiveSystem}
      />

      {/* 2. Hero Section with 3D Word Reveal and 3D Devices */}
      <PetpoojaHero
        onBookDemoClick={scrollToDemo}
        onExploreSystemClick={handleLaunchLiveSystem}
      />

      {/* 3. Trusted Brands Strip */}
      <PetpoojaBrands />

      {/* 4. Why Our Clients Love Us (3D Perspective Tilt Cards) */}
      <PetpoojaPillars />

      {/* 5. Our Ecosystem (3D Interactive Product Cards) */}
      <PetpoojaEcosystem
        onSelectProduct={(prod) => {
          setSelectedProductForDemo(prod);
          scrollToDemo();
        }}
      />

      {/* 6. Key Metrics + Workflow Needs (3D Metrics Entrance) */}
      <PetpoojaOutlets />

      {/* 7. Hear From Our Clients (3D Testimonial Tilt Cards) */}
      <PetpoojaTestimonials />

      {/* 8. Book a Free Demo Form */}
      <PetpoojaDemoForm
        initialSelectedProduct={selectedProductForDemo}
        onApprovedLaunch={handleLaunchLiveSystem}
      />

      {/* 9. Dark Navy Footer */}
      <PetpoojaFooter />
    </div>
  );
};

export default PetpoojaLanding;
