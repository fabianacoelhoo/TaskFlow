import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { useAuth } from '../auth/AuthContext';
import { atualizarMeuPerfil } from '../api/resources';
import type { DisponibilidadeUsuario } from '../api/types';
import { palette } from '../theme/theme';
import { DISPONIBILIDADE_LABEL } from '../theme/status';

function iniciaisDe(nome?: string) {
  return (nome ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function formatarCpf(cpf: string) {
  const digitos = cpf.replace(/\D/g, '');
  if (digitos.length !== 11) return cpf;
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function PerfilPage() {
  const { usuario, sair, recarregarUsuario } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeUsuario>('DISPONIVEL');
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome ?? '');
      setCargo(usuario.cargo ?? '');
      setCpf(usuario.cpf ?? '');
      setDataNascimento(usuario.dataNascimento ?? '');
      setDisponibilidade(usuario.disponibilidade ?? 'DISPONIVEL');
      setHabilidades(usuario.habilidades ?? []);
    }
  }, [usuario]);

  async function salvar() {
    if (!nome.trim()) return;
    setSalvando(true);
    setSalvo(false);
    setErro(null);
    try {
      await atualizarMeuPerfil(nome, cargo || null, cpf || null, dataNascimento || null, disponibilidade, habilidades);
      await recarregarUsuario();
      setSalvo(true);
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Não foi possível salvar o perfil agora.');
    } finally {
      setSalvando(false);
    }
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
                  <PersonRoundedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle1">Dados pessoais</Typography>
              </Stack>
              <Typography variant="body2" sx={{ mb: 2.5 }}>
                Suas informações básicas de identificação.
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  fullWidth
                />

                <TextField label="E-mail" value={usuario?.email ?? ''} disabled fullWidth />

                <TextField
                  label="Data de nascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={cpf && usuario?.cpf ? formatarCpf(cpf) : cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  disabled={Boolean(usuario?.cpf)}
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: usuario?.cpf ? (
                        <Tooltip title="CPF não pode ser alterado depois de cadastrado">
                          <LockRoundedIcon sx={{ fontSize: 18, color: palette.slateLight }} />
                        </Tooltip>
                      ) : undefined,
                    },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
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
                  <BadgeRoundedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle1">Perfil profissional</Typography>
              </Stack>
              <Typography variant="body2" sx={{ mb: 2.5 }}>
                Ajuda a IA a sugerir o responsável certo pra cada tarefa nova.
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Cargo"
                  placeholder="Ex: Dev Backend Sênior"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  fullWidth
                />

                <TextField
                  select
                  label="Disponibilidade"
                  value={disponibilidade}
                  onChange={(e) => setDisponibilidade(e.target.value as DisponibilidadeUsuario)}
                  fullWidth
                >
                  {(Object.keys(DISPONIBILIDADE_LABEL) as DisponibilidadeUsuario[]).map((valor) => (
                    <MenuItem key={valor} value={valor}>
                      {DISPONIBILIDADE_LABEL[valor]}
                    </MenuItem>
                  ))}
                </TextField>

                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={habilidades}
                  onChange={(_, novoValor) => setHabilidades(novoValor as string[])}
                  renderTags={(valor, getTagProps) =>
                    valor.map((habilidade, index) => (
                      <Chip {...getTagProps({ index })} key={habilidade} label={habilidade} size="small" />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Habilidades" placeholder="Digite e pressione Enter" />
                  )}
                />

                {erro && <Alert severity="error">{erro}</Alert>}

                <Button
                  variant="contained"
                  onClick={salvar}
                  disabled={!nome.trim() || salvando}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar perfil'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Reveal>
      </Stack>
    </Box>
  );
}
