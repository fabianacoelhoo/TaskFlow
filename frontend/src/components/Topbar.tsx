import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { palette } from '../theme/theme';
import { NotificationBell } from './NotificationBell';

export function Topbar() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const iniciais = (usuario?.nome ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');

  return (
    <AppBar position="sticky" color="transparent" sx={{ bgcolor: palette.ivory }}>
      <Toolbar sx={{ justifyContent: 'flex-end', gap: 1, py: 1 }}>
        <NotificationBell />

        <Box
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            cursor: 'pointer',
            px: 1,
            py: 0.5,
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(15,28,46,0.04)' },
          }}
        >
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: palette.ink, lineHeight: 1.3 }}>
              {usuario?.nome ?? 'Carregando...'}
            </Typography>
            {usuario?.papel === 'ADMIN' && (
              <Chip
                label="Admin"
                size="small"
                sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(176,141,79,0.15)', color: palette.gold, fontWeight: 700 }}
              />
            )}
          </Box>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: palette.gold,
              color: palette.ink,
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {iniciais || <PersonRoundedIcon fontSize="small" />}
          </Avatar>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/perfil');
            }}
          >
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            Meu perfil
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              sair();
              navigate('/login');
            }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
