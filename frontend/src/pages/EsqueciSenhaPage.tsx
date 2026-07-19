import { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { esqueciSenha } from '../api/resources';
import { palette } from '../theme/theme';
import { Logo } from '../components/Logo';

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await esqueciSenha(email);
      setEnviado(true);
    } catch {
      setErro('Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: palette.ivory,
        px: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 380 }}>
        <Box sx={{ mb: 3 }}>
          <Logo size={30} />
        </Box>

        <Box
          component={RouterLink}
          to="/login"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 3,
            color: palette.slate,
            textDecoration: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            '&:hover': { color: palette.ink },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
          Voltar para o login
        </Box>

        <Typography variant="h4" sx={{ mb: 0.75 }}>
          Esqueceu sua senha?
        </Typography>
        <Typography variant="body2" sx={{ mb: 4 }}>
          Informe seu e-mail e enviaremos um link para você criar uma nova senha.
        </Typography>

        {enviado ? (
          <Alert severity="success">
            Se o e-mail informado estiver cadastrado, você receberá um link de redefinição em instantes.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.25}>
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />

              {erro && <Alert severity="error">{erro}</Alert>}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={carregando}
                sx={{ bgcolor: palette.ink, '&:hover': { bgcolor: palette.navy }, py: 1.4 }}
              >
                Enviar link de redefinição
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
