import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { StatusTarefa, Tarefa, Usuario } from '../api/types';
import { criarTarefa, atualizarTarefa, trocarResponsavel } from '../api/resources';
import { STATUS_LABEL, STATUS_ORDER } from '../theme/status';

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSalvo: () => void;
  projetoId: number;
  usuarios: Usuario[];
  statusInicial: StatusTarefa;
  tarefaExistente?: Tarefa | null;
}

export function TaskFormDialog({
  open,
  onClose,
  onSalvo,
  projetoId,
  usuarios,
  statusInicial,
  tarefaExistente,
}: TaskFormDialogProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<StatusTarefa>(statusInicial);
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [prazo, setPrazo] = useState('');
  const [responsavelId, setResponsavelId] = useState<number | ''>('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (tarefaExistente) {
      setTitulo(tarefaExistente.titulo);
      setDescricao(tarefaExistente.descricao ?? '');
      setStatus(tarefaExistente.status);
      setPrioridade(tarefaExistente.prioridade ?? 'MEDIA');
      setPrazo(tarefaExistente.prazo ?? '');
      setResponsavelId(tarefaExistente.responsavelId);
    } else {
      setTitulo('');
      setDescricao('');
      setStatus(statusInicial);
      setPrioridade('MEDIA');
      setPrazo('');
      setResponsavelId(usuarios[0]?.id ?? '');
    }
  }, [open, tarefaExistente, statusInicial, usuarios]);

  async function salvar() {
    if (!titulo.trim() || responsavelId === '') return;
    setSalvando(true);

    const dto = {
      titulo,
      descricao,
      status,
      prioridade,
      prazo: prazo || null,
    };

    try {
      if (tarefaExistente) {
        await atualizarTarefa(tarefaExistente.id, dto);
        if (responsavelId !== tarefaExistente.responsavelId) {
          await trocarResponsavel(tarefaExistente.id, responsavelId as number);
        }
      } else {
        await criarTarefa(projetoId, responsavelId as number, dto);
      }
      onSalvo();
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{tarefaExistente ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusTarefa)}
              fullWidth
            >
              {STATUS_ORDER.map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Prioridade"
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
              fullWidth
            >
              <MenuItem value="BAIXA">Baixa</MenuItem>
              <MenuItem value="MEDIA">Média</MenuItem>
              <MenuItem value="ALTA">Alta</MenuItem>
            </TextField>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Prazo"
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              select
              label="Responsável"
              value={responsavelId}
              onChange={(e) => setResponsavelId(Number(e.target.value))}
              fullWidth
            >
              {usuarios.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.nome}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={salvar} disabled={!titulo.trim() || salvando}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
