import React, { useEffect, useRef, useState } from 'react';

// 1. Sleek 3D Text Reveal Component that animates each word with 3D rotation & depth on scroll
interface Reveal3DTextProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  highlightWords?: string[];
  highlightClass?: string;
  align?: 'center' | 'left' | 'right';
}

export const Reveal3DText: React.FC<Reveal3DTextProps> = ({
  text,
  className = '',
  tag = 'h2',
  delay = 0,
  highlightWords = [],
  highlightClass = 'text-[#E22637]',
  align = 'center',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const words = text.split(' ');
  const Tag = tag as any;

  const justifyClass =
    align === 'center'
      ? 'justify-center text-center'
      : align === 'right'
      ? 'justify-end text-right'
      : 'justify-start text-left';

  return (
    <div
      ref={containerRef}
      className={`perspective-1000 ${align === 'center' ? 'w-full flex justify-center' : 'inline-block'} overflow-hidden py-1`}
    >
      <Tag className={`flex flex-wrap items-center ${justifyClass} gap-x-2.5 sm:gap-x-3.5 gap-y-1.5 ${className}`}>
        {words.map((word, idx) => {
          const isHighlighted = highlightWords.some(
            (hw) => word.toLowerCase().includes(hw.toLowerCase())
          );
          return (
            <span
              key={idx}
              className={`inline-block transform-gpu transition-all duration-700 ease-out ${
                isHighlighted ? highlightClass : ''
              }`}
              style={{
                transform: isVisible
                  ? 'translateY(0) rotateX(0deg) translateZ(0) scale(1)'
                  : 'translateY(40px) rotateX(55deg) translateZ(-40px) scale(0.92)',
                opacity: isVisible ? 1 : 0,
                transitionDelay: `${delay + idx * 45}ms`,
                transformOrigin: 'bottom center',
                display: 'inline-block',
                textShadow: isVisible && isHighlighted
                  ? '0 4px 20px rgba(226,38,55,0.25)'
                  : 'none',
              }}
            >
              {word}
            </span>
          );
        })}
      </Tag>
    </div>
  );
};

// 2. 3D Card Entrance & Interactive Cursor Tilt Component
interface Reveal3DCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  tiltMax?: number;
}

export const Reveal3DCard: React.FC<Reveal3DCardProps> = ({
  children,
  className = '',
  delay = 0,
  tiltMax = 8,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltMax;
    const rotateY = ((x - centerX) / centerX) * tiltMax;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 transform-gpu transition-all duration-700 ease-out ${className}`}
      style={{
        transform: isVisible
          ? `translateY(0) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1)`
          : 'translateY(60px) rotateX(16deg) scale(0.94)',
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        transformStyle: 'preserve-3d',
        boxShadow: isVisible
          ? '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 1px 1px rgba(255, 255, 255, 0.05)'
          : 'none',
      }}
    >
      {children}
    </div>
  );
};

// 3. Floating 3D Badge / Particle with gentle float animation
interface Floating3DBadgeProps {
  emoji?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
}

export const Floating3DBadge: React.FC<Floating3DBadgeProps> = ({
  emoji,
  label,
  className = '',
  style = {},
  duration = 4,
}) => {
  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg pointer-events-none select-none animate-float ${className}`}
      style={{
        animationDuration: `${duration}s`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {label && <span className="text-[11px] font-bold tracking-wide">{label}</span>}
    </div>
  );
};

// 4. Sleek Top Scroll Reading Progress Bar
export const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[60] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[#E22637] via-rose-500 to-[#E22637] shadow-[0_0_10px_#E22637] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};
