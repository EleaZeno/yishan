import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useReducedMotion } from 'framer-motion';

// ============================================================
// Spring Physics Utilities
// ============================================================

/**
 * Create a spring-animated counter that smoothly transitions between values
 */
export function useSpringCounter(
  targetValue: number,
  springConfig?: { stiffness?: number; damping?: number; mass?: number }
) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const { stiffness = 100, damping = 15, mass = 1 } = springConfig || {};

  useEffect(() => {
    const startValue = displayValue;
    const diff = targetValue - startValue;

    if (diff === 0) return;

    // Animate using spring physics
    let startTime: number | null = null;
    const duration = 600; // max duration

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Spring easing (approximation)
      const eased = 1 - Math.pow(1 - progress, 3);
      const spring = 1 - Math.pow(1 - progress, 3) * Math.cos(progress * Math.PI * 2);

      const current = startValue + diff * eased;
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue]);

  return displayValue;
}

/**
 * Create an animated progress ring
 */
export function AnimatedProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'var(--primary)',
  bgColor = 'var(--muted)',
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Animated number with spring physics
 */
export function AnimatedNumber({
  value,
  duration = 1000,
  formatter = (v: number) => v.toString(),
  className,
}: {
  value: number;
  duration?: number;
  formatter?: (v: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const diff = end - start;

    if (diff === 0) return;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;

      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{formatter(Math.round(display))}</span>;
}

/**
 * Staggered entrance animation wrapper
 */
export function StaggeredList({
  children,
  staggerDelay = 50,
  className,
}: {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * staggerDelay / 1000,
            type: 'spring',
            stiffness: 200,
            damping: 25,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader with shimmer effect
 */
export function Skeleton({
  className,
  width,
  height,
  borderRadius = '0.5rem',
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}) {
  return (
    <motion.div
      className={`bg-muted ${className || ''}`}
      style={{ width, height, borderRadius }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/**
 * Pulse animation for attention-grabbing elements
 */
export function PulseDot({
  color = 'bg-primary',
  size = 8,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <span className="relative inline-flex">
      <motion.span
        className={`absolute inline-flex h-full w-full rounded-full ${color}`}
        animate={{
          scale: [1, 2, 2],
          opacity: [0.5, 0, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <motion.span
        className={`relative inline-flex rounded-full ${color}`}
        style={{ width: size, height: size }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </span>
  );
}

/**
 * Number ticker for counting up/down animations
 */
export function NumberTicker({
  value,
  duration = 800,
  className,
  prefix = '',
  suffix = '',
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = display;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * eased;

      setDisplay(Math.round(current));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

/**
 * Card flip animation
 */
export function FlipCard({
  front,
  back,
  isFlipped,
  flipAxis = 'y',
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  flipAxis?: 'x' | 'y';
}) {
  return (
    <motion.div
      style={{ perspective: 1000 }}
      animate={{ rotateY: isFlipped ? 180 : 0, rotateX: flipAxis === 'x' ? (isFlipped ? 180 : 0) : 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div style={{ backfaceVisibility: 'hidden' }}>
        {!isFlipped && front}
      </div>
      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        {isFlipped && back}
      </div>
    </motion.div>
  );
}

/**
 * Magnetic button effect (follows cursor slightly)
 */
export function MagneticButton({
  children,
  strength = 0.2,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setPosition({ x, y });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Confetti explosion effect
 */
export function ConfettiExplosion({
  active,
  colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'],
  particleCount = 50,
}: {
  active: boolean;
  colors?: string[];
  particleCount?: number;
}) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; color: string; rotation: number; scale: number }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
    }));

    setParticles(newParticles);

    // Clear after animation
    setTimeout(() => setParticles([]), 2000);
  }, [active, colors, particleCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-3 h-3"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{
            opacity: 1,
            scale: p.scale,
            rotate: p.rotation,
            y: 0,
          }}
          animate={{
            opacity: 0,
            scale: 0,
            rotate: p.rotation + 720,
            y: window.innerHeight,
          }}
          transition={{
            duration: 2 + Math.random(),
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Water ripple effect on click
 */
export function RippleButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden ${className}`}>
      {children}
      <style>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          transform: scale(0);
          animation: ripple-animation 0.6s linear;
          pointer-events: none;
        }
        @keyframes ripple-animation {
          to { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </button>
  );
}

/**
 * Text reveal animation
 */
export function TextReveal({
  children,
  delay = 0,
  className,
}: {
  children: string;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`overflow-hidden ${className}`}>
      {children.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: (delay + i * 0.02),
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}
