import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { interpretarTarefaComIA } from '../api/resources';
import type { DadosIniciaisTarefa } from './TaskFormDialog';
import { palette } from '../theme/theme';

interface CriarTarefaIADialogProps {
  open: boolean;
  onClose: () => void;
  projetoId: number;
  onInterpretado: (dados: DadosIniciaisTarefa) => void;
}

export function CriarTarefaIADialog({ open, onClose, projetoId, onInterpretado }: CriarTarefaIADialogProps) {
  const [texto, setTexto] = useState('');
  const [interpretando, setInterpretando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function fechar() {
    setTexto('');
    setErro(null);
    onClose();
  }

  async function interpretar() {
    if (!texto.trim()) return;
    setInterpretando(true);
    setErro(null);
    try {
      const resultado = await interpretarTarefaComIA(projetoId, texto);
      onInterpretado({
        titulo: resultado.titulo,
        descricao: resultado.descricao,
        prioridade: resultado.prioridade,
        prazo: resultado.prazo,
        responsavelId: resultado.responsavelId,
      });
      setTexto('');
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Não foi possível interpretar esse texto agora.');
    } finally {
      setInterpretando(false);
    }
  }

  return (
    <Dialog open={open} onClose={interpretando ? undefined : fechar} fullWidth maxWidth="sm">
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
          Criar tarefa por texto
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Typography variant="body2">
            Descreva a tarefa em uma frase. A IA identifica título, prazo, prioridade e
            responsável (se você mencionar alguém do projeto).
          </Typography>

          <TextField
            label="O que precisa ser feito?"
            placeholder='Ex: "Revisão do PR pro João até sexta, alta prioridade"'
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            autoFocus
            disabled={interpretando}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                interpretar();
              }
            }}
          />

          {erro && <Alert severity="error">{erro}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={fechar} color="inherit" disabled={interpretando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={interpretar}
          disabled={!texto.trim() || interpretando}
          startIcon={<AutoAwesomeRoundedIcon />}
        >
          {interpretando ? 'Interpretando...' : 'Continuar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
