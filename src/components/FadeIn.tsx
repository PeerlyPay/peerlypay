import { type ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeIn({ children, delay, className = '' }: FadeInProps) {
  return (
    <div
      className={`animate-fadeIn ${className}`.trim()}
      style={delay != null ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
