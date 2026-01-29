import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function Header() {
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headerRef.current || !titleRef.current) return;

    // Initial animation
    gsap.fromTo(
      titleRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    // Subtle breathing animation
    gsap.to(titleRef.current, {
      scale: 1.02,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }, []);

  return (
    <header ref={headerRef} className="border-b-2 border-[#1a1a1a] py-6 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h1 ref={titleRef} className="brutal-heading text-3xl md:text-5xl">
          Qraw
        </h1>
        <p className="font-medium mt-2 text-[#737373]">
          Fast, offline-ready QR code generator
        </p>
      </div>
    </header>
  );
}
