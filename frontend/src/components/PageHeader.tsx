import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
      spacing={2}
      sx={{ mb: 4 }}
    >
      <Box>
        {eyebrow && (
          <Typography variant="overline" sx={{ color: 'accentGold.main' }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}
