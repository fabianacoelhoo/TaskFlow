import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { gerarPlanoBacklogComIA } from '../api/resources';
import type { PlanoBacklogGerado, Usuario } from '../api/types';
import { palette } from '../theme/theme';

interface GerarPlanoIADialogProps {
  open: boolean;
  onClose: () => void;
  onGerado: () => void;
  projetoId: number;
  usuarios: Usuario[];
}

export function GerarPlanoIADialog({ open, onClose, onGerado, projetoId, usuarios }: GerarPlanoIADialogProps) {
  const [descricao, setDescricao] = useState('');
  const [responsavelId, setResponsavelId] = useState<number | ''>(usuarios[0]?.id ?? '');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [plano, setPlano] = useState<PlanoBacklogGerado | null>(null);

  useEffect(() => {
    if (responsavelId === '' && usuarios.length > 0) {
      setResponsavelId(usuarios[0].id);
    }
  }, [usuarios, responsavelId]);

  function fechar() {
    setDescricao('');
    setErro(null);
    setPlano(null);
    onClose();
  }

  async function gerar() {
    if (!descricao.trim() || responsavelId === '') return;
    setGerando(true);
    setErro(null);
    try {
      const gerado = await gerarPlanoBacklogComIA(projetoId, descricao, responsavelId as number);
      setPlano(gerado);
      onGerado();
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Não foi possível gerar o backlog agora.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <Dialog open={open} onClose={gerando ? undefined : fechar} fullWidth maxWidth="sm">
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
              bgcolor: 'rgba(176,141,79,0.14)',
              color: palette.gold,
            }}
          >
            <AutoAwesomeRoundedIcon fontSize="small" />
          </Box>
          Gerar backlog com IA
        </Stack>
      </DialogTitle>
      <DialogContent>
        {plano ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="success">
              Épico "{plano.epico.titulo}" criado com {plano.historias.length} história(s) e suas tarefas, no backlog do produto.
            </Alert>

            <Stack spacing={1}>
              {plano.historias.map((h) => (
                <Stack key={h.id} direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {h.titulo}
                  </Typography>
                  {h.pontos !== null && <Chip label={`${h.pontos} pts`} size="small" sx={{ height: 20, fontSize: '0.68rem' }} />}
                </Stack>
              ))}
            </Stack>

            {plano.riscos.length > 0 && (
              <Box>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                  <ReportProblemRoundedIcon sx={{ fontSize: 16, color: palette.danger }} />
                  <Typography variant="subtitle2">Riscos identificados</Typography>
                </Stack>
                <Stack spacing={0.5}>
                  {plano.riscos.map((risco, i) => (
                    <Typography key={i} variant="body2" sx={{ color: palette.slate }}>
                      • {risco}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2">
              Descreva uma ideia ou funcionalidade. A IA vai gerar um épico, histórias de usuário com
              critérios de aceitação e pontos, as tarefas de cada história e os riscos do plano — tudo
              direto no backlog do produto, pronto para você organizar em sprints.
            </Typography>

            <TextField
              label="Ideia ou funcionalidade"
              placeholder='Ex: "Precisamos de um sistema de pagamentos com cartão de crédito"'
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              multiline
              minRows={4}
              autoFocus
              disabled={gerando}
            />

            <TextField
              select
              label="Responsável pelas tarefas geradas"
              value={responsavelId}
              onChange={(e) => setResponsavelId(Number(e.target.value))}
              fullWidth
              disabled={gerando}
            >
              {usuarios.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.nome}
                </MenuItem>
              ))}
            </TextField>

            {erro && <Alert severity="error">{erro}</Alert>}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {plano ? (
          <Button variant="contained" onClick={fechar}>
            Fechar
          </Button>
        ) : (
          <>
            <Button onClick={fechar} color="inherit" disabled={gerando}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={gerar}
              disabled={!descricao.trim() || responsavelId === '' || gerando}
              startIcon={<AutoAwesomeRoundedIcon />}
            >
              {gerando ? 'Gerando...' : 'Gerar backlog'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
