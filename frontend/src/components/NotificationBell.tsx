import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  IconButton,
  Menu,
  Stack,
  Typography,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import {
  contarNotificacoesNaoLidas,
  listarNotificacoes,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
} from '../api/resources';
import type { Notificacao } from '../api/types';
import { palette } from '../theme/theme';

const INTERVALO_POLLING_MS = 30000;

export function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    atualizarContagem();
    const intervalo = setInterval(atualizarContagem, INTERVALO_POLLING_MS);
    return () => clearInterval(intervalo);
  }, []);

  function atualizarContagem() {
    contarNotificacoesNaoLidas().then(setNaoLidas);
  }

  function abrir(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
    listarNotificacoes().then(setNotificacoes);
  }

  async function handleClicarNotificacao(notificacao: Notificacao) {
    if (!notificacao.lida) {
      await marcarNotificacaoComoLida(notificacao.id);
      setNotificacoes((atual) =>
        atual.map((n) => (n.id === notificacao.id ? { ...n, lida: true } : n)),
      );
      atualizarContagem();
    }
  }

  async function handleMarcarTodas() {
    await marcarTodasNotificacoesComoLidas();
    setNotificacoes((atual) => atual.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
  }

  function formatarTempo(data: string) {
    const diffMs = Date.now() - new Date(data).getTime();
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `${minutos} min atrás`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;
    return `${Math.floor(horas / 24)}d atrás`;
  }

  return (
    <>
      <IconButton onClick={abrir}>
        <Badge badgeContent={naoLidas} color="error">
          <NotificationsRoundedIcon sx={{ color: palette.ink }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 440 } } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25 }}>
          <Typography variant="subtitle2">Notificações</Typography>
          {naoLidas > 0 && (
            <Button size="small" onClick={handleMarcarTodas} sx={{ minWidth: 0 }}>
              Marcar todas como lidas
            </Button>
          )}
        </Stack>

        {notificacoes.length === 0 && (
          <Typography variant="body2" sx={{ px: 2, py: 3, textAlign: 'center' }}>
            Nenhuma notificação por aqui.
          </Typography>
        )}

        {notificacoes.map((n) => (
          <Box
            key={n.id}
            onClick={() => handleClicarNotificacao(n)}
            sx={{
              px: 2,
              py: 1.25,
              cursor: 'pointer',
              borderLeft: n.lida ? '3px solid transparent' : `3px solid ${palette.gold}`,
              bgcolor: n.lida ? 'transparent' : 'rgba(176,141,79,0.06)',
              '&:hover': { bgcolor: 'rgba(15,28,46,0.04)' },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: n.lida ? 400 : 600 }}>
              {n.mensagem}
            </Typography>
            <Typography variant="caption" sx={{ color: palette.slateLight }}>
              {formatarTempo(n.criadoEm)}
            </Typography>
          </Box>
        ))}
      </Menu>
    </>
  );
}
