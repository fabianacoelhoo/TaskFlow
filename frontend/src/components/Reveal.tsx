import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  sx?: SxProps<Theme>;
}

export function Reveal({ children, delay = 0, y = 28, sx }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
