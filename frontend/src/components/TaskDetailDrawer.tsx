import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import type { Anexo, Comentario, HistoricoItem, Tarefa, Usuario } from '../api/types';
import {
  baixarAnexo,
  criarComentario,
  enviarAnexo,
  excluirTarefa,
  listarAnexos,
  listarComentarios,
  listarHistorico,
} from '../api/resources';
import { palette } from '../theme/theme';
import { PRIORIDADE_COLOR, PRIORIDADE_LABEL, STATUS_COLOR, STATUS_LABEL } from '../theme/status';

interface TaskDetailDrawerProps {
  tarefa: Tarefa | null;
  responsavel?: Usuario;
  onClose: () => void;
  onEditar: () => void;
  onExcluida: () => void;
}

function iniciais(nome?: string) {
  if (!nome) return '?';
  return nome.split(' ').slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export function TaskDetailDrawer({ tarefa, responsavel, onClose, onEditar, onExcluida }: TaskDetailDrawerProps) {
  const [aba, setAba] = useState(0);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [enviandoAnexo, setEnviandoAnexo] = useState(false);

  useEffect(() => {
    if (!tarefa) return;
    setAba(0);
    carregarTudo(tarefa.id);
  }, [tarefa]);

  function carregarTudo(tarefaId: number) {
    listarComentarios(tarefaId).then(setComentarios);
    listarHistorico(tarefaId).then(setHistorico);
    listarAnexos(tarefaId).then(setAnexos);
  }

  async function handleComentar() {
    if (!tarefa || !novoComentario.trim()) return;
    setEnviandoComentario(true);
    try {
      await criarComentario(tarefa.id, novoComentario);
      setNovoComentario('');
      const atualizados = await listarComentarios(tarefa.id);
      setComentarios(atualizados);
    } finally {
      setEnviandoComentario(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!tarefa || !arquivo) return;
    setEnviandoAnexo(true);
    try {
      await enviarAnexo(tarefa.id, arquivo);
      const atualizados = await listarAnexos(tarefa.id);
      setAnexos(atualizados);
      const historicoAtualizado = await listarHistorico(tarefa.id);
      setHistorico(historicoAtualizado);
    } finally {
      setEnviandoAnexo(false);
      event.target.value = '';
    }
  }

  async function handleExcluir() {
    if (!tarefa) return;
    if (!window.confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) return;
    await excluirTarefa(tarefa.id);
    onExcluida();
  }

  return (
    <Drawer anchor="right" open={Boolean(tarefa)} onClose={onClose}>
      {tarefa && (
        <Box sx={{ width: { xs: '100vw', sm: 460 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ p: 3, pb: 2 }}>
            <Box sx={{ pr: 2 }}>
              <Chip
                label={STATUS_LABEL[tarefa.status]}
                size="small"
                sx={{
                  bgcolor: `${STATUS_COLOR[tarefa.status]}1A`,
                  color: STATUS_COLOR[tarefa.status],
                  fontWeight: 700,
                  mb: 1.25,
                }}
              />
              <Typography variant="h6">{tarefa.titulo}</Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ px: 3, pb: 2 }}>
            <Button size="small" startIcon={<EditRoundedIcon />} onClick={onEditar}>
              Editar
            </Button>
            <Button size="small" color="error" startIcon={<DeleteRoundedIcon />} onClick={handleExcluir}>
              Excluir
            </Button>
          </Stack>

          <Stack spacing={1.25} sx={{ px: 3, pb: 2.5 }}>
            {tarefa.descricao && (
              <Typography variant="body2" sx={{ color: palette.slate }}>
                {tarefa.descricao}
              </Typography>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              {tarefa.prioridade && (
                <Chip
                  label={`Prioridade ${PRIORIDADE_LABEL[tarefa.prioridade] ?? tarefa.prioridade}`}
                  size="small"
                  sx={{
                    bgcolor: `${PRIORIDADE_COLOR[tarefa.prioridade] ?? palette.slate}1A`,
                    color: PRIORIDADE_COLOR[tarefa.prioridade] ?? palette.slate,
                  }}
                />
              )}
              {tarefa.prazo && (
                <Chip
                  icon={<EventRoundedIcon sx={{ fontSize: '16px !important' }} />}
                  label={tarefa.prazo.split('-').reverse().join('/')}
                  size="small"
                  variant="outlined"
                />
              )}
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ ml: 'auto' }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: palette.gold, color: palette.ink }}>
                  {iniciais(responsavel?.nome)}
                </Avatar>
                <Typography variant="body2">{responsavel?.nome ?? 'Sem responsável'}</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Tabs
            value={aba}
            onChange={(_, v) => setAba(v)}
            sx={{ px: 3, borderBottom: `1px solid ${palette.line}` }}
          >
            <Tab label={`Comentários (${comentarios.length})`} />
            <Tab label={`Anexos (${anexos.length})`} />
            <Tab label="Histórico" />
          </Tabs>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
            {aba === 0 && (
              <Stack spacing={2}>
                {comentarios.length === 0 && (
                  <Typography variant="body2">Nenhum comentário ainda.</Typography>
                )}
                {comentarios.map((c) => (
                  <Box key={c.id}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: palette.ink, color: palette.ivory }}>
                        {iniciais(c.usuarioNome)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {c.usuarioNome}
                      </Typography>
                      <Typography variant="caption" sx={{ color: palette.slateLight }}>
                        {new Date(c.criadoEm).toLocaleString('pt-BR')}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ pl: 3.75 }}>
                      {c.texto}
                    </Typography>
                  </Box>
                ))}

                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <TextField
                    placeholder="Escreva um comentário..."
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    fullWidth
                    size="small"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComentar();
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleComentar}
                    disabled={!novoComentario.trim() || enviandoComentario}
                  >
                    <SendRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            )}

            {aba === 1 && (
              <Stack spacing={1.5}>
                {anexos.length === 0 && <Typography variant="body2">Nenhum anexo ainda.</Typography>}
                {anexos.map((a) => (
                  <Stack
                    key={a.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 1.25, border: `1px solid ${palette.line}`, borderRadius: 2 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <AttachFileRoundedIcon fontSize="small" sx={{ color: palette.slate }} />
                      <Typography variant="body2" noWrap>
                        {a.nomeArquivo}
                      </Typography>
                    </Stack>
                    <IconButton size="small" onClick={() => baixarAnexo(a.id, a.nomeArquivo)}>
                      <DownloadRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileRoundedIcon />}
                  disabled={enviandoAnexo}
                  sx={{ mt: 1 }}
                >
                  Adicionar anexo
                  <input type="file" hidden onChange={handleUpload} />
                </Button>
              </Stack>
            )}

            {aba === 2 && (
              <Stack spacing={2}>
                {historico.length === 0 && <Typography variant="body2">Sem histórico ainda.</Typography>}
                {historico
                  .slice()
                  .reverse()
                  .map((h) => (
                    <Stack key={h.id} direction="row" spacing={1.5}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: palette.gold, mt: 0.9, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="body2">{h.acao}</Typography>
                        <Typography variant="caption" sx={{ color: palette.slateLight }}>
                          {h.usuarioNome} · {new Date(h.data).toLocaleString('pt-BR')}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
