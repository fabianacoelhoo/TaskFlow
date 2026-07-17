import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { palette } from '../theme/theme';
import { Logo } from './Logo';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: SpaceDashboardRoundedIcon,
    match: (p: string) => p === '/dashboard',
  },
  {
    label: 'Projetos',
    to: '/projetos',
    icon: FolderCopyRoundedIcon,
    match: (p: string) => p.startsWith('/projetos'),
  },
  {
    label: 'Calendário',
    to: '/calendario',
    icon: CalendarMonthRoundedIcon,
    match: (p: string) => p.startsWith('/calendario'),
  },
  {
    label: 'Perfil',
    to: '/perfil',
    icon: PersonRoundedIcon,
    match: (p: string) => p.startsWith('/perfil'),
  },
];

const SIDEBAR_WIDTH = 248;

export function Sidebar() {
  const location = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        bgcolor: palette.ink,
        color: palette.ivory,
        display: 'flex',
        flexDirection: 'column',
        px: 2.5,
        py: 3,
      }}
    >
      <Box sx={{ px: 1, mb: 5 }}>
        <Logo size={32} light />
      </Box>

      <Stack spacing={0.5} sx={{ flex: 1 }}>
        {NAV_ITEMS.map(({ label, to, icon: Icon, match }) => {
          const active = match(location.pathname);
          return (
            <Tooltip key={to} title={label} placement="right" arrow disableInteractive>
              <Box
                component={NavLink}
                to={to}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.75,
                  py: 1.25,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: active ? palette.ink : alphaWhite(0.72),
                  bgcolor: active ? palette.gold : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  '&:hover': {
                    bgcolor: active ? palette.gold : alphaWhite(0.08),
                    color: active ? palette.ink : palette.ivory,
                  },
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
                {label}
              </Box>
            </Tooltip>
          );
        })}
      </Stack>

      <Box sx={{ px: 1 }}>
        <Typography variant="caption" sx={{ color: alphaWhite(0.4) }}>
          TaskFlow &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
}

function alphaWhite(opacity: number) {
  return `rgba(248, 246, 241, ${opacity})`;
}
