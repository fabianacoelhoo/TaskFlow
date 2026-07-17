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
import GitHubIcon from '@mui/icons-material/GitHub';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import CommitRoundedIcon from '@mui/icons-material/CommitRounded';
import MergeTypeRoundedIcon from '@mui/icons-material/MergeTypeRounded';
import type { AtividadeGithub, Anexo, Comentario, HistoricoItem, Tarefa, Usuario } from '../api/types';
import {
  baixarAnexo,
  criarComentario,
  enviarAnexo,
  excluirTarefa,
  listarAnexos,
  listarComentarios,
  listarHistorico,
  obterAtividadeGithub,
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
  const [atividadeGithub, setAtividadeGithub] = useState<AtividadeGithub | null>(null);
  const [carregandoGithub, setCarregandoGithub] = useState(false);
  const [erroGithub, setErroGithub] = useState<string | null>(null);

  useEffect(() => {
    if (!tarefa) return;
    setAba(0);
    carregarTudo(tarefa.id);
    carregarGithub(tarefa.id);
  }, [tarefa]);

  function carregarTudo(tarefaId: number) {
    listarComentarios(tarefaId).then(setComentarios);
    listarHistorico(tarefaId).then(setHistorico);
    listarAnexos(tarefaId).then(setAnexos);
  }

  function carregarGithub(tarefaId: number) {
    setCarregandoGithub(true);
    setErroGithub(null);
    obterAtividadeGithub(tarefaId)
      .then(setAtividadeGithub)
      .catch((err) => {
        setAtividadeGithub(null);
        setErroGithub(err?.response?.data?.erro ?? 'Não foi possível consultar o GitHub agora.');
      })
      .finally(() => setCarregandoGithub(false));
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

            {tarefa.tags.length > 0 && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {tarefa.tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.nome}
                    size="small"
                    sx={{ bgcolor: `${tag.cor}1A`, color: tag.cor, fontWeight: 700, height: 22, fontSize: '0.7rem' }}
                  />
                ))}
              </Stack>
            )}

            {tarefa.dependencias.length > 0 && (
              <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                <Typography variant="caption" sx={{ color: palette.slateLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Depende de
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {tarefa.dependencias.map((dep) => (
                    <Chip
                      key={dep.id}
                      label={dep.titulo}
                      size="small"
                      sx={{
                        bgcolor: `${STATUS_COLOR[dep.status]}1A`,
                        color: STATUS_COLOR[dep.status],
                        height: 22,
                        fontSize: '0.7rem',
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>

          <Tabs
            value={aba}
            onChange={(_, v) => setAba(v)}
            sx={{ px: 3, borderBottom: `1px solid ${palette.line}` }}
          >
            <Tab label={`Comentários (${comentarios.length})`} />
            <Tab label={`Anexos (${anexos.length})`} />
            <Tab label="Histórico" />
            <Tab label="GitHub" icon={<GitHubIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 48 }} />
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

            {aba === 3 && (
              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: palette.slateLight }}>
                    Busca por <code>tarefa-{tarefa.id}</code> em branches, commits e PRs.
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={() => carregarGithub(tarefa.id)}
                    disabled={carregandoGithub}
                  >
                    Sincronizar
                  </Button>
                </Stack>

                {carregandoGithub && <Typography variant="body2">Consultando o GitHub...</Typography>}

                {!carregandoGithub && erroGithub && (
                  <Typography variant="body2" sx={{ color: palette.slateLight }}>
                    {erroGithub}
                  </Typography>
                )}

                {!carregandoGithub && atividadeGithub && (
                  <>
                    {atividadeGithub.branches.length === 0 &&
                      atividadeGithub.commits.length === 0 &&
                      atividadeGithub.pullRequests.length === 0 && (
                        <Typography variant="body2" sx={{ color: palette.slateLight }}>
                          Nenhuma atividade encontrada ainda para essa tarefa.
                        </Typography>
                      )}

                    {atividadeGithub.branches.length > 0 && (
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: palette.slateLight }}>
                          BRANCHES
                        </Typography>
                        {atividadeGithub.branches.map((b) => (
                          <Stack key={b.nome} component="a" href={b.url} target="_blank" rel="noopener" direction="row" spacing={1} alignItems="center" sx={{ color: palette.ink, textDecoration: 'none' }}>
                            <CallSplitRoundedIcon fontSize="small" sx={{ color: palette.slateLight }} />
                            <Typography variant="body2">{b.nome}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}

                    {atividadeGithub.commits.length > 0 && (
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: palette.slateLight }}>
                          COMMITS
                        </Typography>
                        {atividadeGithub.commits.map((c) => (
                          <Stack key={c.sha} component="a" href={c.url} target="_blank" rel="noopener" direction="row" spacing={1} alignItems="flex-start" sx={{ color: palette.ink, textDecoration: 'none' }}>
                            <CommitRoundedIcon fontSize="small" sx={{ color: palette.slateLight, mt: 0.25 }} />
                            <Box>
                              <Typography variant="body2">{c.mensagem}</Typography>
                              <Typography variant="caption" sx={{ color: palette.slateLight }}>
                                {c.autor} · {c.sha}
                              </Typography>
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
                    )}

                    {atividadeGithub.pullRequests.length > 0 && (
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: palette.slateLight }}>
                          PULL REQUESTS
                        </Typography>
                        {atividadeGithub.pullRequests.map((pr) => (
                          <Stack key={pr.numero} component="a" href={pr.url} target="_blank" rel="noopener" direction="row" spacing={1} alignItems="center" sx={{ color: palette.ink, textDecoration: 'none' }}>
                            <MergeTypeRoundedIcon fontSize="small" sx={{ color: palette.slateLight }} />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              #{pr.numero} {pr.titulo}
                            </Typography>
                            <Chip label={pr.estado} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </>
                )}
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
