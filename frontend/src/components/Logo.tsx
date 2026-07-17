import { Box, Stack, Typography } from '@mui/material';
import { palette } from '../theme/theme';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  light?: boolean;
}

export function Logo({ size = 36, withWordmark = true, light = false }: LogoProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.1}>
      <Box
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: size * 0.28,
          background: `linear-gradient(135deg, ${palette.ink} 0%, ${palette.navy} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(15,28,46,0.28)',
        }}
      >
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
          <rect x="1.5" y="14" width="5" height="8.5" rx="1.6" fill={palette.goldLight} />
          <rect x="9.5" y="8.5" width="5" height="14" rx="1.6" fill={palette.gold} />
          <rect x="17.5" y="1.5" width="5" height="21" rx="1.6" fill={palette.goldLight} />
        </svg>
      </Box>
      {withWordmark && (
        <Typography
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
            fontSize: size * 0.5,
            color: light ? palette.ivory : palette.ink,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          TaskFlow
        </Typography>
      )}
    </Stack>
  );
}
