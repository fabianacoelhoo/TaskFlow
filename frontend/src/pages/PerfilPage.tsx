import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { useAuth } from '../auth/AuthContext';
import { palette } from '../theme/theme';
import { alterarPapel, listarUsuarios } from '../api/resources';
import type { Papel, Usuario } from '../api/types';

function iniciaisDe(nome?: string) {
  return (nome ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function PerfilPage() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [equipe, setEquipe] = useState<Usuario[]>([]);

  const ehAdmin = usuario?.papel === 'ADMIN';

  useEffect(() => {
    if (ehAdmin) {
      listarUsuarios().then(setEquipe);
    }
  }, [ehAdmin]);

  async function handleAlterarPapel(usuarioId: number, papel: Papel) {
    const atualizado = await alterarPapel(usuarioId, papel);
    setEquipe((atual) => atual.map((u) => (u.id === usuarioId ? atualizado : u)));
  }

  return (
    <Box>
      <PageHeader eyebrow="Conta" title="Meu perfil" subtitle="Suas informações de acesso ao TaskFlow." />

      <Stack spacing={3} sx={{ maxWidth: 520 }}>
        <Reveal>
          <Card elevation={0} sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                height: 88,
                background: `linear-gradient(135deg, ${palette.ink} 0%, ${palette.navy} 100%)`,
                position: 'relative',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `radial-gradient(circle at 15% 30%, rgba(176,141,79,0.35) 0%, transparent 55%)`,
                }}
              />
            </Box>

            <CardContent sx={{ p: 4, pt: 0 }}>
              <Stack alignItems="center" spacing={2} sx={{ mb: 3, mt: -6.5 }}>
                <Avatar
                  sx={{
                    width: 84,
                    height: 84,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    bgcolor: palette.gold,
                    color: palette.ink,
                    border: `4px solid ${palette.paper}`,
                    boxShadow: '0 8px 20px rgba(15,28,46,0.18)',
                  }}
                >
                  {iniciaisDe(usuario?.nome)}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{usuario?.nome}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{usuario?.email}</Typography>
                  <Chip
                    label={usuario?.papel === 'ADMIN' ? 'Administrador' : 'Membro'}
                    size="small"
                    sx={{
                      bgcolor: usuario?.papel === 'ADMIN' ? 'rgba(176,141,79,0.15)' : 'rgba(15,28,46,0.06)',
                      color: usuario?.papel === 'ADMIN' ? palette.gold : palette.slate,
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<LogoutRoundedIcon />}
                onClick={() => {
                  sair();
                  navigate('/login');
                }}
              >
                Sair da conta
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        {ehAdmin && (
          <Reveal delay={0.1}>
            <Card elevation={0}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(176,141,79,0.14)',
                      color: palette.gold,
                    }}
                  >
                    <GroupsRoundedIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle1">Equipe</Typography>
                </Stack>
                <Typography variant="body2" sx={{ mb: 2.5 }}>
                  Como administradora, você pode promover ou rebaixar membros da equipe.
                </Typography>

                <Stack spacing={0.5}>
                  {equipe.map((u) => (
                    <Stack
                      key={u.id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        transition: 'background-color 0.15s ease',
                        '&:hover': { bgcolor: 'rgba(15,28,46,0.03)' },
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: palette.ink, color: palette.ivory }}>
                        {iniciaisDe(u.nome)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {u.nome}
                        </Typography>
                        <Typography variant="caption" sx={{ color: palette.slateLight }} noWrap>
                          {u.email}
                        </Typography>
                      </Box>
                      <Select
                        size="small"
                        value={u.papel ?? 'MEMBRO'}
                        onChange={(e) => handleAlterarPapel(u.id, e.target.value as Papel)}
                        disabled={u.id === usuario?.id}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="MEMBRO">Membro</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                      </Select>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Reveal>
        )}
      </Stack>
    </Box>
  );
}
