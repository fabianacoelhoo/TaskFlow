import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import { gerarTarefasComIA } from '../api/resources';
import type { Usuario } from '../api/types';
import { palette } from '../theme/theme';

interface GerarTarefasIADialogProps {
  open: boolean;
  onClose: () => void;
  onGerado: () => void;
  projetoId: number;
  usuarios: Usuario[];
}

export function GerarTarefasIADialog({
  open,
  onClose,
  onGerado,
  projetoId,
  usuarios,
}: GerarTarefasIADialogProps) {
  const [descricao, setDescricao] = useState('');
  const [responsavelId, setResponsavelId] = useState<number | ''>(usuarios[0]?.id ?? '');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [quantidadeGerada, setQuantidadeGerada] = useState<number | null>(null);

  useEffect(() => {
    if (responsavelId === '' && usuarios.length > 0) {
      setResponsavelId(usuarios[0].id);
    }
  }, [usuarios, responsavelId]);

  function fechar() {
    setDescricao('');
    setErro(null);
    setQuantidadeGerada(null);
    onClose();
  }

  async function gerar() {
    if (!descricao.trim() || responsavelId === '') return;
    setGerando(true);
    setErro(null);
    try {
      const tarefas = await gerarTarefasComIA(projetoId, descricao, responsavelId as number);
      setQuantidadeGerada(tarefas.length);
      onGerado();
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Não foi possível gerar as tarefas agora.');
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
          Gerar tarefas com IA
        </Stack>
      </DialogTitle>
      <DialogContent>
        {quantidadeGerada !== null ? (
          <Alert severity="success" sx={{ mt: 1 }}>
            {quantidadeGerada} tarefa(s) criada(s) e adicionada(s) ao quadro.
          </Alert>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2">
              Descreva uma ideia ou funcionalidade em poucas palavras. A IA vai quebrar isso em
              tarefas prontas para o Kanban.
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
        {quantidadeGerada !== null ? (
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
              {gerando ? 'Gerando...' : 'Gerar tarefas'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
