import { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { redefinirSenha } from '../api/resources';
import { palette } from '../theme/theme';
import { Logo } from '../components/Logo';

export function RedefinirSenhaPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await redefinirSenha(token, novaSenha);
      setSucesso(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Não foi possível redefinir a senha. O link pode ter expirado.');
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
          Criar nova senha
        </Typography>
        <Typography variant="body2" sx={{ mb: 4 }}>
          Escolha uma nova senha para acessar sua conta.
        </Typography>

        {!token && <Alert severity="error">Link inválido: token de redefinição não encontrado.</Alert>}

        {token && sucesso ? (
          <Alert severity="success">Senha redefinida com sucesso! Redirecionando para o login...</Alert>
        ) : (
          token && (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.25}>
                <TextField
                  label="Nova senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
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
                  Redefinir senha
                </Button>
              </Stack>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}
