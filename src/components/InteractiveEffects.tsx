import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';

// ─── Reduced Motion Hook ────────────────────────────────────────────────────
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ─── Spotlight ──────────────────────────────────────────────────────────────
export function Spotlight() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let raf: number;
    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      document.documentElement.style.setProperty('--mouse-x', `${mx}px`);
      document.documentElement.style.setProperty('--mouse-y', `${my}px`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, [reduced]);
  return null;
}

// ─── Custom Cursor — pure rAF lerp, zero React state during movement ────────
export function CustomCursor() {
  const reduced = useReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch / mobile devices
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return;

    let rafId: number;
    let mx = -200, my = -200;          // raw mouse
    let ox = -200, oy = -200;          // outer (lagging)
    const LERP = 0.13;                 // 0-1: lower = more lag

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };

    const setHover = (val: boolean) => {
      if (!outerRef.current || !innerRef.current) return;
      if (val) {
        outerRef.current.style.transform = `translate3d(${ox}px,${oy}px,0) scale(1.7)`;
        outerRef.current.style.background = 'rgba(99,102,241,0.14)';
        outerRef.current.style.borderColor = 'rgba(99,102,241,0.8)';
        outerRef.current.style.boxShadow = '0 0 18px rgba(99,102,241,0.35)';
        innerRef.current.style.transform = `translate3d(${mx - 5}px,${my - 5}px,0) scale(0.55)`;
      } else {
        outerRef.current.style.background = 'transparent';
        outerRef.current.style.borderColor = 'rgba(99,102,241,0.4)';
        outerRef.current.style.boxShadow = 'none';
        innerRef.current.style.transform = `translate3d(${mx - 5}px,${my - 5}px,0) scale(1)`;
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHover(!!t.closest('button,a,input,textarea,select,[role="button"],.interactive-card'));
    };

    const tick = () => {
      // Lerp outer ring toward raw mouse
      ox += (mx - ox) * LERP;
      oy += (my - oy) * LERP;

      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${mx - 5}px,${my - 5}px,0)`;
      }
      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${ox - 16}px,${oy - 16}px,0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    rafId = requestAnimationFrame(tick);

    // Show cursors after first move
    const show = () => {
      if (innerRef.current) innerRef.current.style.opacity = '1';
      if (outerRef.current) outerRef.current.style.opacity = '1';
    };
    window.addEventListener('mousemove', show, { once: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <>
      {/* Inner sharp dot */}
      <div
        ref={innerRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 10, height: 10,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          willChange: 'transform',
          boxShadow: '0 0 10px rgba(99,102,241,0.7)',
          transition: 'transform 0.06s linear',
        }}
      />
      {/* Outer lagging ring */}
      <div
        ref={outerRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 32, height: 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(99,102,241,0.4)',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0,
          willChange: 'transform',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0s',
        }}
      />
    </>
  );
}

// ─── Magnetic ────────────────────────────────────────────────────────────────
export function Magnetic({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const dx = e.clientX - (left + width / 2);
    const dy = e.clientY - (top + height / 2);
    if (Math.hypot(dx, dy) < 140) setPos({ x: dx * 0.22, y: dy * 0.22 });
    else setPos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.12 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

// ─── Tilt ────────────────────────────────────────────────────────────────────
export function Tilt({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const mx = (e.clientX - left) / width;
    const my = (e.clientY - top) / height;
    setRot({ x: (my - 0.5) * -7, y: (mx - 0.5) * 7 });
  };

  return (
    <motion.div
      ref={ref}
      className={`${className} interactive-card`}
      onMouseMove={onMove}
      onMouseLeave={() => setRot({ x: 0, y: 0 })}
      animate={{ rotateX: rot.x, rotateY: rot.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      {children}
    </motion.div>
  );
}

// ─── Ripple Button ───────────────────────────────────────────────────────────
interface Ripple { id: string; x: number; y: number; size: number; }

export function RippleButton({
  children, className = '', onClick, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Math.random().toString(36).substr(2, 9);
    setRipples(prev => [...prev, { id, x, y, size }]);
    if (onClick) onClick(e);
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const t = setTimeout(() => setRipples(p => p.slice(1)), 750);
      return () => clearTimeout(t);
    }
  }, [ripples]);

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={`relative overflow-hidden cursor-none select-none ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full">{children}</span>
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

// ─── Count Up ────────────────────────────────────────────────────────────────
export function CountUp({ to, duration = 1.0 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { setCount(to); return; }
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      setCount(Math.floor(p * (2 - p) * to));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(to);
    };
    requestAnimationFrame(tick);
  }, [to, duration, reduced]);

  return <span>{count}</span>;
}

// ─── Skeleton Shimmer ─────────────────────────────────────────────────────────
export function SkeletonShimmer({ className = '', ...rest }: { className?: string; [k: string]: any }) {
  return (
    <div className={`skeleton ${className}`} {...rest} />
  );
}

// ─── Floating Label Input ─────────────────────────────────────────────────────
export interface FloatingInputProps {
  label: string;
  icon?: React.ReactNode;
  id?: string;
  type?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  rows?: number;     // for textarea variant hint
}

export function FloatingInput({ label, icon, className = '', id, type = 'text', ...props }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value !== undefined && props.value !== '';

  return (
    <div className="input-container">
      {/* Icon — rendered before input so CSS sibling selectors work */}
      {icon && (
        <div className={`input-icon transition-colors duration-200 ${focused ? 'text-indigo-500' : 'text-slate-400'}`}>
          {icon}
        </div>
      )}

      <input
        id={id}
        type={type}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`floating-input ${icon ? 'has-icon' : ''} ${className}`}
        {...props}
      />

      <label
        htmlFor={id}
        className={`floating-label ${icon ? 'with-icon' : ''} ${
          focused || hasValue
            ? 'top-2 text-[0.6rem] font-extrabold tracking-widest uppercase text-indigo-600'
            : ''
        }`}
      >
        {label}
      </label>

      {/* Focus ring pulse */}
      {focused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 rounded-[0.875rem] ring-2 ring-indigo-400/20 pointer-events-none"
        />
      )}
    </div>
  );
}
