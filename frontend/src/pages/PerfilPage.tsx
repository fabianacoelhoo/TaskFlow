import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { useAuth } from '../auth/AuthContext';
import { palette } from '../theme/theme';

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
      </Stack>
    </Box>
  );
}
