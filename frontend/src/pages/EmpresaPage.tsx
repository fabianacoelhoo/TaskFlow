import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { useAuth } from '../auth/AuthContext';
import { palette } from '../theme/theme';
import { alterarPapel, listarUsuarios, obterEmpresa, regenerarCodigoConvite } from '../api/resources';
import type { Empresa, Papel, Usuario } from '../api/types';

function iniciaisDe(nome?: string) {
  return (nome ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function EmpresaPage() {
  const { usuario } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [equipe, setEquipe] = useState<Usuario[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [regenerando, setRegenerando] = useState(false);

  useEffect(() => {
    obterEmpresa().then(setEmpresa);
    listarUsuarios().then(setEquipe);
  }, []);

  if (usuario && usuario.papel !== 'ADMIN') {
    return <Navigate to="/perfil" replace />;
  }

  async function handleAlterarPapel(usuarioId: number, papel: Papel) {
    const atualizado = await alterarPapel(usuarioId, papel);
    setEquipe((atual) => atual.map((u) => (u.id === usuarioId ? atualizado : u)));
  }

  async function handleRegenerar() {
    if (!window.confirm('Gerar um novo código invalida o código atual. Continuar?')) return;
    setRegenerando(true);
    try {
      const atualizada = await regenerarCodigoConvite();
      setEmpresa(atualizada);
    } finally {
      setRegenerando(false);
    }
  }

  function copiarCodigo() {
    if (!empresa?.codigoConvite) return;
    navigator.clipboard.writeText(empresa.codigoConvite);
    setCopiado(true);
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Administração"
        title="Sua empresa"
        subtitle="Convide colegas e gerencie quem tem acesso ao TaskFlow."
      />

      <Stack spacing={3} sx={{ maxWidth: 560 }}>
        <Reveal>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
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
                  <ApartmentRoundedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle1">{empresa?.nome ?? 'Carregando...'}</Typography>
              </Stack>

              <Typography variant="body2" sx={{ mb: 1.5 }}>
                Compartilhe este código com sua equipe para que cada pessoa crie sua própria conta
                vinculada à empresa.
              </Typography>

              <Stack direction="row" spacing={1}>
                <TextField
                  value={empresa?.codigoConvite ?? ''}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 } }}
                />
                <Button variant="outlined" onClick={copiarCodigo} sx={{ minWidth: 0, px: 1.5 }}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleRegenerar}
                  disabled={regenerando}
                  sx={{ minWidth: 0, px: 1.5 }}
                >
                  <RefreshRoundedIcon fontSize="small" />
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Reveal>

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
      </Stack>

      <Snackbar
        open={copiado}
        autoHideDuration={2500}
        onClose={() => setCopiado(false)}
        message="Código copiado"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
