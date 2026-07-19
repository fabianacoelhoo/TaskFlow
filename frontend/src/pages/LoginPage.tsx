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
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import { useAuth } from '../auth/AuthContext';
import { login, registrarComCodigo, registrarEmpresa } from '../api/resources';
import { palette } from '../theme/theme';
import { Logo } from '../components/Logo';

type Modo = 'entrar' | 'criar';
type SubModo = 'empresa' | 'codigo';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [modo, setModo] = useState<Modo>(
    searchParams.get('modo') === 'criar' ? 'criar' : 'entrar',
  );
  const [subModo, setSubModo] = useState<SubModo | null>(null);

  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const { entrar } = useAuth();
  const navigate = useNavigate();

  function irParaModo(novoModo: Modo) {
    setErro(null);
    setModo(novoModo);
    setSubModo(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      if (modo === 'criar') {
        if (subModo === 'empresa') {
          await registrarEmpresa(nomeEmpresa, nome, email, senha);
        } else if (subModo === 'codigo') {
          await registrarComCodigo(codigoConvite, nome, email, senha);
        }
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

  const titulo =
    modo === 'entrar'
      ? 'Bem-vinda de volta'
      : subModo === 'empresa'
        ? 'Criar a conta da sua empresa'
        : subModo === 'codigo'
          ? 'Entrar com código de convite'
          : 'Criar sua conta';

  const subtitulo =
    modo === 'entrar'
      ? 'Entre com suas credenciais para acessar seus projetos.'
      : subModo === 'empresa'
        ? 'Você será a administradora e receberá um código para convidar sua equipe.'
        : subModo === 'codigo'
          ? 'Peça o código de convite para a administradora da sua empresa.'
          : 'Sua empresa já usa o TaskFlow ou é a primeira vez por aqui?';

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
            {titulo}
          </Typography>
          <Typography variant="body2" sx={{ mb: 4 }}>
            {subtitulo}
          </Typography>

          {modo === 'criar' && subModo === null && (
            <Stack spacing={1.5}>
              <OpcaoCadastro
                icon={<ApartmentRoundedIcon />}
                titulo="Criar empresa nova"
                descricao="Sua empresa ainda não usa o TaskFlow."
                onClick={() => setSubModo('empresa')}
              />
              <OpcaoCadastro
                icon={<KeyRoundedIcon />}
                titulo="Tenho um código de convite"
                descricao="Minha empresa já tem uma conta no TaskFlow."
                onClick={() => setSubModo('codigo')}
              />

              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                Já tem uma conta?{' '}
                <Box
                  component="button"
                  type="button"
                  onClick={() => irParaModo('entrar')}
                  sx={linkButtonSx}
                >
                  Entrar
                </Box>
              </Typography>
            </Stack>
          )}

          {(modo === 'entrar' || subModo !== null) && (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.25}>
                {modo === 'criar' && subModo === 'empresa' && (
                  <TextField
                    label="Nome da empresa"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    required
                    fullWidth
                  />
                )}
                {modo === 'criar' && subModo === 'codigo' && (
                  <TextField
                    label="Código de convite"
                    value={codigoConvite}
                    onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
                    required
                    fullWidth
                  />
                )}
                {modo === 'criar' && (
                  <TextField
                    label="Seu nome"
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

                {modo === 'entrar' && (
                  <Typography variant="body2" sx={{ textAlign: 'right', mt: -1.5 }}>
                    <Box component={RouterLink} to="/esqueci-senha" sx={{ ...linkButtonSx, textDecoration: 'none' }}>
                      Esqueci minha senha
                    </Box>
                  </Typography>
                )}

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

                {modo === 'criar' ? (
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    <Box component="button" type="button" onClick={() => setSubModo(null)} sx={linkButtonSx}>
                      Voltar
                    </Box>
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    Ainda não tem conta?{' '}
                    <Box component="button" type="button" onClick={() => irParaModo('criar')} sx={linkButtonSx}>
                      Criar conta
                    </Box>
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const linkButtonSx = {
  background: 'none',
  border: 'none',
  p: 0,
  font: 'inherit',
  fontWeight: 700,
  color: palette.gold,
  cursor: 'pointer',
};

function OpcaoCadastro({
  icon,
  titulo,
  descricao,
  onClick,
}: {
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        width: '100%',
        textAlign: 'left',
        border: `1px solid ${palette.line}`,
        borderRadius: 2,
        p: 2,
        bgcolor: 'transparent',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': { borderColor: palette.gold, bgcolor: 'rgba(176,141,79,0.06)' },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(176,141,79,0.14)',
          color: palette.gold,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2">{titulo}</Typography>
        <Typography variant="caption" sx={{ color: palette.slateLight }}>
          {descricao}
        </Typography>
      </Box>
    </Box>
  );
}
