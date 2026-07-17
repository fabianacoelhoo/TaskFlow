import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useAuth } from '../auth/AuthContext';
import { login, registrar } from '../api/resources';
import { palette } from '../theme/theme';
import { Logo } from '../components/Logo';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [modo, setModo] = useState<'entrar' | 'criar'>(
    searchParams.get('modo') === 'criar' ? 'criar' : 'entrar',
  );
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const { entrar } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      if (modo === 'criar') {
        await registrar(nome, email, senha);
      }
      const { token } = await login(email, senha);
      entrar(token);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const mensagem =
        err?.response?.data?.erro ??
        (modo === 'criar'
          ? 'Não foi possível criar a conta. Verifique os dados.'
          : 'E-mail ou senha inválidos.');
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: palette.ink,
          color: palette.ivory,
          px: 8,
          py: 7,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 20%, ${palette.navy} 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(176,141,79,0.25) 0%, transparent 45%)`,
          }}
        />

        <Box sx={{ position: 'relative' }}>
          <Logo size={34} light />
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 460 }}>
          <Typography
            sx={{
              fontFamily: '"Fraunces", serif',
              fontWeight: 600,
              fontSize: '2.6rem',
              lineHeight: 1.15,
              mb: 3,
            }}
          >
            Clareza e ritmo para conduzir cada projeto com precisão.
          </Typography>
          <Typography sx={{ color: 'rgba(248,246,241,0.7)', fontSize: '1rem', lineHeight: 1.7 }}>
            Kanban, cronogramas, comentários e histórico completo em um só lugar —
            pensado para times que levam entrega a sério.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(248,246,241,0.4)', position: 'relative' }}>
          &copy; {new Date().getFullYear()} TaskFlow. Todos os direitos reservados.
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: palette.ivory,
          px: 3,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Box sx={{ display: { md: 'none' }, mb: 2 }}>
            <Logo size={30} />
          </Box>

          <Box
            component={RouterLink}
            to="/"
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
            Voltar para a página inicial
          </Box>

          <Typography variant="h4" sx={{ mb: 0.75 }}>
            {modo === 'entrar' ? 'Bem-vinda de volta' : 'Criar sua conta'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 4 }}>
            {modo === 'entrar'
              ? 'Entre com suas credenciais para acessar seus projetos.'
              : 'Preencha os dados abaixo para começar a usar o TaskFlow.'}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.25}>
              {modo === 'criar' && (
                <TextField
                  label="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  fullWidth
                />
              )}
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                fullWidth
              />

              {erro && <Alert severity="error">{erro}</Alert>}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={carregando}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  bgcolor: palette.ink,
                  '&:hover': { bgcolor: palette.navy },
                  py: 1.4,
                }}
              >
                {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            {modo === 'entrar' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <Box
              component="button"
              type="button"
              onClick={() => {
                setErro(null);
                setModo(modo === 'entrar' ? 'criar' : 'entrar');
              }}
              sx={{
                background: 'none',
                border: 'none',
                p: 0,
                font: 'inherit',
                fontWeight: 700,
                color: palette.gold,
                cursor: 'pointer',
              }}
            >
              {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
