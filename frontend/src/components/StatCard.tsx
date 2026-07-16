import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { palette } from '../theme/theme';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: SvgIconComponent;
  tone?: 'default' | 'danger' | 'success';
}

const TONES = {
  default: { fg: palette.ink, bg: 'rgba(15,28,46,0.06)' },
  danger: { fg: palette.danger, bg: 'rgba(179,68,30,0.10)' },
  success: { fg: palette.success, bg: 'rgba(46,125,91,0.10)' },
};

export function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  const colors = TONES[tone];

  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: palette.slate }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '2.25rem', fontWeight: 700, color: colors.fg, lineHeight: 1.1 }}>
              {value}
            </Typography>
          </Stack>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: colors.bg,
              color: colors.fg,
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
