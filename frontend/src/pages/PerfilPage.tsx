import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';
import { palette } from '../theme/theme';

export function PerfilPage() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  const iniciais = (usuario?.nome ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <Box>
      <PageHeader eyebrow="Conta" title="Meu perfil" subtitle="Suas informações de acesso ao TaskFlow." />

      <Card elevation={0} sx={{ maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar
              sx={{
                width: 84,
                height: 84,
                fontSize: '1.75rem',
                fontWeight: 700,
                bgcolor: palette.gold,
                color: palette.ink,
              }}
            >
              {iniciais}
            </Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{usuario?.nome}</Typography>
              <Typography variant="body2">{usuario?.email}</Typography>
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
    </Box>
  );
}
