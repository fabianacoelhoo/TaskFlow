import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { conectarGithub, desconectarGithub, statusGithub } from '../api/resources';
import type { StatusGithub } from '../api/types';
import { palette } from '../theme/theme';

interface IntegracaoGithubDialogProps {
  open: boolean;
  onClose: () => void;
  projetoId: number;
  podeGerenciar: boolean;
}

export function IntegracaoGithubDialog({ open, onClose, projetoId, podeGerenciar }: IntegracaoGithubDialogProps) {
  const [status, setStatus] = useState<StatusGithub | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCarregando(true);
    setErro(null);
    setOwner('');
    setRepo('');
    setToken('');
    statusGithub(projetoId).then((s) => {
      setStatus(s);
      setCarregando(false);
    });
  }, [open, projetoId]);

  async function handleConectar() {
    if (!owner.trim() || !repo.trim() || !token.trim()) return;
    setSalvando(true);
    setErro(null);
    try {
      const s = await conectarGithub(projetoId, owner.trim(), repo.trim(), token.trim());
      setStatus(s);
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Não foi possível conectar agora.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleDesconectar() {
    if (!window.confirm('Desconectar este repositório do GitHub?')) return;
    setSalvando(true);
    try {
      await desconectarGithub(projetoId);
      setStatus({ conectado: false, repositorioOwner: null, repositorioNome: null });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(15,28,46,0.08)',
              color: palette.ink,
            }}
          >
            <GitHubIcon fontSize="small" />
          </Box>
          GitHub
        </Stack>
      </DialogTitle>
      <DialogContent>
        {carregando ? (
          <Typography variant="body2">Carregando...</Typography>
        ) : status?.conectado ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="success">
              Conectado a{' '}
              <strong>
                {status.repositorioOwner}/{status.repositorioNome}
              </strong>
              .
            </Alert>
            <Typography variant="body2" sx={{ color: palette.slate }}>
              Pra vincular uma tarefa, inclua <code>tarefa-{'{id}'}</code> no nome da branch, na
              mensagem do commit ou no título do PR.
            </Typography>
            {podeGerenciar && (
              <Button color="error" variant="outlined" onClick={handleDesconectar} disabled={salvando}>
                Desconectar
              </Button>
            )}
          </Stack>
        ) : podeGerenciar ? (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: palette.slate }}>
              Conecte um repositório usando um{' '}
              <Link href="https://github.com/settings/tokens" target="_blank" rel="noopener">
                Personal Access Token
              </Link>{' '}
              do GitHub com permissão de leitura. Depois, inclua <code>tarefa-{'{id}'}</code> no
              nome da branch, no commit ou no PR pra vincular à tarefa correspondente.
            </Typography>
            <TextField label="Dono do repositório (owner)" placeholder="ex: minha-empresa" value={owner} onChange={(e) => setOwner(e.target.value)} fullWidth />
            <TextField label="Nome do repositório" placeholder="ex: taskflow" value={repo} onChange={(e) => setRepo(e.target.value)} fullWidth />
            <TextField label="Token de acesso" type="password" value={token} onChange={(e) => setToken(e.target.value)} fullWidth />
            {erro && <Alert severity="error">{erro}</Alert>}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: palette.slateLight, py: 2 }}>
            Nenhum repositório conectado ainda. Só o dono do projeto ou um administrador da
            empresa pode conectar.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
        {!carregando && !status?.conectado && podeGerenciar && (
          <Button variant="contained" onClick={handleConectar} disabled={!owner.trim() || !repo.trim() || !token.trim() || salvando}>
            {salvando ? 'Conectando...' : 'Conectar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
