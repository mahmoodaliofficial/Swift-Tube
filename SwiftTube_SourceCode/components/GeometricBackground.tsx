'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export function GeometricBackground() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  
  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050505]">
      
      {/* Interactive Mouse Spotlight */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 pointer-events-none mix-blend-screen"
        animate={{
          x: mousePos.x - 300,
          y: mousePos.y - 300,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
        style={{
          background: 'radial-gradient(circle, var(--theme-color-1) 0%, transparent 70%)',
        }}
      />

      {/* Deep Space Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating Orbs (Glows) using CSS variables */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen animate-blob" 
        style={{ backgroundColor: 'var(--theme-color-2)', opacity: 0.15 }}
      />
      <div 
        className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"
        style={{ backgroundColor: 'var(--theme-color-1)', opacity: 0.1 }}
      />
      <div 
        className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"
        style={{ backgroundColor: 'var(--theme-color-3)', opacity: 0.15 }}
      />

      {/* Animated Geometric Shapes */}
      
      {/* Hexagon 1 */}
      <svg className="absolute top-[15%] left-[10%] w-64 h-64 opacity-20 animate-float-slow" style={{ color: 'var(--theme-color-1)' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" className="animate-spin-slow-reverse" style={{ transformOrigin: '50% 50%' }} />
      </svg>

      {/* Hexagon 2 */}
      <svg className="absolute bottom-[20%] right-[10%] w-96 h-96 opacity-10 animate-float-delayed" style={{ color: 'var(--theme-color-3)' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" className="animate-spin-slow" style={{ transformOrigin: '50% 50%' }} />
      </svg>

      {/* Triangle */}
      <svg className="absolute top-[40%] right-[25%] w-40 h-40 opacity-20 animate-float-slow" style={{ color: 'var(--theme-color-2)' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
        <polygon points="50,15 90,85 10,85" className="animate-spin-slow-reverse" style={{ transformOrigin: '50% 55%' }} />
      </svg>

      {/* Square Wireframe */}
      <svg className="absolute bottom-[30%] left-[25%] w-48 h-48 opacity-[0.15] text-white animate-float-delayed" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
        <rect x="20" y="20" width="60" height="60" className="animate-spin-slow" style={{ transformOrigin: '50% 50%' }} />
        <rect x="30" y="30" width="40" height="40" className="animate-spin-slow-reverse" style={{ transformOrigin: '50% 50%' }} />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none" />
    </div>
  );
}
