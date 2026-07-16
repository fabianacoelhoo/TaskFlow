import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
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
      <Toolbar sx={{ justifyContent: 'flex-end', gap: 1.5, py: 1 }}>
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
          <Typography variant="body2" sx={{ fontWeight: 600, color: palette.ink }}>
            {usuario?.nome ?? 'Carregando...'}
          </Typography>
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
