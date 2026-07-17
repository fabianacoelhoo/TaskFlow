import { useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { palette } from '../../theme/theme';

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  light?: boolean;
  durationMs?: number;
}

export function StatCounter({
  value,
  suffix = '',
  prefix = '',
  label,
  light = false,
  durationMs = 1400,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          let raf: number;
          const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          observer.disconnect();
          return () => cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return (
    <Box ref={ref}>
      <Stack direction="row" alignItems="baseline" spacing={0.25}>
        <Typography
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
            fontSize: { xs: '2rem', md: '2.6rem' },
            color: light ? palette.ivory : palette.ink,
            lineHeight: 1,
          }}
        >
          {prefix}
          {display}
          {suffix}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{ color: light ? 'rgba(248,246,241,0.65)' : palette.slate, mt: 0.5 }}
      >
        {label}
      </Typography>
    </Box>
  );
}
