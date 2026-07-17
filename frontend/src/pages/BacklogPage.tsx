import { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { GerarPlanoIADialog } from '../components/GerarPlanoIADialog';
import {
  criarEpico,
  criarHistoria,
  criarSprint,
  excluirEpico,
  excluirHistoria,
  atualizarHistoria,
  iniciarSprint,
  concluirSprint,
  listarEpicos,
  listarHistorias,
  listarProjetos,
  listarSprints,
  listarUsuarios,
  type NovaHistoria,
  type NovaSprint,
} from '../api/resources';
import type { Epico, HistoriaUsuario, Projeto, Sprint, StatusSprint, Usuario } from '../api/types';
import { palette } from '../theme/theme';

const STATUS_SPRINT_LABEL: Record<StatusSprint, string> = {
  PLANEJADA: 'Planejada',
  ATIVA: 'Ativa',
  CONCLUIDA: 'Concluída',
};

const STATUS_SPRINT_COLOR: Record<StatusSprint, string> = {
  PLANEJADA: palette.slate,
  ATIVA: palette.gold,
  CONCLUIDA: palette.success,
};

export function BacklogPage() {
  const { id } = useParams();
  const projetoId = Number(id);
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [epicos, setEpicos] = useState<Epico[]>([]);
  const [historias, setHistorias] = useState<HistoriaUsuario[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [dialogSprintAberto, setDialogSprintAberto] = useState(false);
  const [dialogEpicoAberto, setDialogEpicoAberto] = useState(false);
  const [dialogHistoriaAberto, setDialogHistoriaAberto] = useState<{ epicoId: number | null } | null>(null);
  const [dialogIaAberto, setDialogIaAberto] = useState(false);

  function carregar() {
    setCarregando(true);
    Promise.all([
      listarEpicos(projetoId),
      listarHistorias(projetoId),
      listarSprints(projetoId),
      listarUsuarios(),
    ]).then(([epicosCarregados, historiasCarregadas, sprintsCarregadas, usuariosCarregados]) => {
      setEpicos(epicosCarregados);
      setHistorias(historiasCarregadas);
      setSprints(sprintsCarregadas);
      setUsuarios(usuariosCarregados);
      setCarregando(false);
    });
  }

  useEffect(() => {
    listarProjetos().then((lista) => setProjeto(lista.find((p) => p.id === projetoId) ?? null));
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId]);

  const historiasBacklog = useMemo(() => historias.filter((h) => h.sprintId === null), [historias]);

  const historiasPorEpico = useMemo(() => {
    const mapa = new Map<number, HistoriaUsuario[]>();
    historiasBacklog.forEach((h) => {
      if (h.epicoId === null) return;
      mapa.set(h.epicoId, [...(mapa.get(h.epicoId) ?? []), h]);
    });
    return mapa;
  }, [historiasBacklog]);

  const historiasSemEpico = useMemo(
    () => historiasBacklog.filter((h) => h.epicoId === null),
    [historiasBacklog],
  );

  const existeSprintAtiva = sprints.some((s) => s.status === 'ATIVA');

  async function handleMoverParaSprint(historia: HistoriaUsuario, sprintId: number | null) {
    const payload: NovaHistoria = {
      titulo: historia.titulo,
      descricao: historia.descricao,
      criteriosAceitacao: historia.criteriosAceitacao,
      pontos: historia.pontos,
      prioridade: historia.prioridade ?? 'MEDIA',
      epicoId: historia.epicoId,
      sprintId,
    };
    await atualizarHistoria(historia.id, payload);
    carregar();
  }

  async function handleIniciarSprint(sprintId: number) {
    await iniciarSprint(sprintId);
    carregar();
  }

  async function handleConcluirSprint(sprintId: number) {
    await concluirSprint(sprintId);
    carregar();
  }

  async function handleExcluirEpico(epico: Epico) {
    if (!window.confirm(`Excluir o épico "${epico.titulo}"? As histórias voltam para "Sem épico".`)) return;
    await excluirEpico(epico.id);
    carregar();
  }

  async function handleExcluirHistoria(historia: HistoriaUsuario) {
    if (!window.confirm(`Excluir a história "${historia.titulo}"?`)) return;
    await excluirHistoria(historia.id);
    carregar();
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <IconButton size="small" onClick={() => navigate(`/projetos/${projetoId}`)}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="overline" sx={{ color: 'accentGold.main' }}>
          {projeto?.nome ?? 'Projeto'}
        </Typography>
      </Stack>

      <PageHeader
        title="Backlog & Sprints"
        subtitle="Organize épicos, histórias de usuário e o planejamento das sprints."
      />

      {carregando ? (
        <Stack spacing={2.5}>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
        </Stack>
      ) : (
        <Stack spacing={4}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Sprints</Typography>
              <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setDialogSprintAberto(true)}>
                Nova sprint
              </Button>
            </Stack>

            {sprints.length === 0 ? (
              <Typography variant="body2" sx={{ color: palette.slateLight }}>
                Nenhuma sprint criada ainda.
              </Typography>
            ) : (
              <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                {sprints.map((sprint, i) => (
                  <Reveal key={sprint.id} delay={(i % 6) * 0.05} sx={{ minWidth: 260 }}>
                    <Card elevation={0} sx={{ minWidth: 260 }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                          <Typography variant="subtitle2">{sprint.nome}</Typography>
                          <Chip
                            label={STATUS_SPRINT_LABEL[sprint.status]}
                            size="small"
                            sx={{
                              bgcolor: `${STATUS_SPRINT_COLOR[sprint.status]}1F`,
                              color: STATUS_SPRINT_COLOR[sprint.status],
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" sx={{ color: palette.slateLight, display: 'block', mb: 1 }}>
                          {sprint.dataInicio} — {sprint.dataFim}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {sprint.totalHistorias} história(s) • {sprint.totalPontos} pontos
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {sprint.status === 'PLANEJADA' && (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<BoltRoundedIcon />}
                              disabled={existeSprintAtiva}
                              onClick={() => handleIniciarSprint(sprint.id)}
                            >
                              Iniciar
                            </Button>
                          )}
                          {sprint.status === 'ATIVA' && (
                            <Button size="small" variant="contained" onClick={() => handleConcluirSprint(sprint.id)}>
                              Concluir
                            </Button>
                          )}
                          <Button size="small" variant="outlined" onClick={() => navigate(`/projetos/${projetoId}/sprints/${sprint.id}`)}>
                            Abrir
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Reveal>
                ))}
              </Stack>
            )}
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Backlog do produto</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AutoAwesomeRoundedIcon />}
                  onClick={() => setDialogIaAberto(true)}
                >
                  Gerar com IA
                </Button>
                <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setDialogEpicoAberto(true)}>
                  Novo épico
                </Button>
                <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setDialogHistoriaAberto({ epicoId: null })}>
                  Nova história
                </Button>
              </Stack>
            </Stack>

            <Stack spacing={1.5}>
              {epicos.map((epico) => (
                <Accordion key={epico.id} elevation={0} disableGutters sx={{ border: `1px solid ${palette.line}`, borderRadius: 3, '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%', pr: 1 }}>
                      <Box>
                        <Typography variant="subtitle2">{epico.titulo}</Typography>
                        {epico.descricao && (
                          <Typography variant="caption" sx={{ color: palette.slateLight }}>
                            {epico.descricao}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`${(historiasPorEpico.get(epico.id) ?? []).length} história(s)`} size="small" />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExcluirEpico(epico);
                          }}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {(historiasPorEpico.get(epico.id) ?? []).map((historia) => (
                        <HistoriaCard
                          key={historia.id}
                          historia={historia}
                          sprints={sprints}
                          onMover={handleMoverParaSprint}
                          onExcluir={handleExcluirHistoria}
                        />
                      ))}
                      <Button
                        size="small"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => setDialogHistoriaAberto({ epicoId: epico.id })}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Nova história neste épico
                      </Button>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}

              <Box>
                <Typography variant="caption" sx={{ color: palette.slateLight, fontWeight: 700, mb: 1, display: 'block' }}>
                  SEM ÉPICO
                </Typography>
                <Stack spacing={1}>
                  {historiasSemEpico.length === 0 ? (
                    <Typography variant="body2" sx={{ color: palette.slateLight }}>
                      Nenhuma história solta no backlog.
                    </Typography>
                  ) : (
                    historiasSemEpico.map((historia) => (
                      <HistoriaCard
                        key={historia.id}
                        historia={historia}
                        sprints={sprints}
                        onMover={handleMoverParaSprint}
                        onExcluir={handleExcluirHistoria}
                      />
                    ))
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Stack>
      )}

      <NovaSprintDialog
        open={dialogSprintAberto}
        onClose={() => setDialogSprintAberto(false)}
        onCriar={async (sprint) => {
          await criarSprint(projetoId, sprint);
          setDialogSprintAberto(false);
          carregar();
        }}
      />

      <NovoEpicoDialog
        open={dialogEpicoAberto}
        onClose={() => setDialogEpicoAberto(false)}
        onCriar={async (titulo, descricao) => {
          await criarEpico(projetoId, titulo, descricao);
          setDialogEpicoAberto(false);
          carregar();
        }}
      />

      <NovaHistoriaDialog
        open={dialogHistoriaAberto !== null}
        epicoIdInicial={dialogHistoriaAberto?.epicoId ?? null}
        epicos={epicos}
        onClose={() => setDialogHistoriaAberto(null)}
        onCriar={async (historia) => {
          await criarHistoria(projetoId, historia);
          setDialogHistoriaAberto(null);
          carregar();
        }}
      />

      <GerarPlanoIADialog
        open={dialogIaAberto}
        onClose={() => setDialogIaAberto(false)}
        onGerado={carregar}
        projetoId={projetoId}
        usuarios={usuarios}
      />
    </Box>
  );
}

function HistoriaCard({
  historia,
  sprints,
  onMover,
  onExcluir,
}: {
  historia: HistoriaUsuario;
  sprints: Sprint[];
  onMover: (historia: HistoriaUsuario, sprintId: number | null) => void;
  onExcluir: (historia: HistoriaUsuario) => void;
}) {
  const sprintsDisponiveis = sprints.filter((s) => s.status !== 'CONCLUIDA');

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${palette.line}`,
        transition: 'background-color 0.15s ease',
        '&:hover': { bgcolor: 'rgba(15,28,46,0.02)' },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {historia.titulo}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 0.25 }}>
          {historia.pontos !== null && (
            <Chip label={`${historia.pontos} pts`} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
          )}
          {historia.prioridade && (
            <Chip label={historia.prioridade} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
          )}
        </Stack>
      </Box>
      <Select<number | ''>
        size="small"
        value={historia.sprintId ?? ''}
        displayEmpty
        onChange={(e) => onMover(historia, e.target.value === '' ? null : Number(e.target.value))}
        sx={{ minWidth: 140, fontSize: '0.8rem' }}
      >
        <MenuItem value="">Backlog</MenuItem>
        {sprintsDisponiveis.map((s) => (
          <MenuItem key={s.id} value={s.id}>
            {s.nome}
          </MenuItem>
        ))}
      </Select>
      <IconButton size="small" onClick={() => onExcluir(historia)}>
        <DeleteRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

function NovaSprintDialog({
  open,
  onClose,
  onCriar,
}: {
  open: boolean;
  onClose: () => void;
  onCriar: (sprint: NovaSprint) => Promise<void>;
}) {
  const [nome, setNome] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setNome('');
      setObjetivo('');
      setDataInicio('');
      setDataFim('');
    }
  }, [open]);

  async function salvar() {
    setSalvando(true);
    try {
      await onCriar({ nome, objetivo: objetivo || null, dataInicio, dataFim });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nova sprint</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} fullWidth autoFocus />
          <TextField
            label="Objetivo"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={salvar} disabled={!nome.trim() || !dataInicio || !dataFim || salvando}>
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function NovoEpicoDialog({
  open,
  onClose,
  onCriar,
}: {
  open: boolean;
  onClose: () => void;
  onCriar: (titulo: string, descricao: string) => Promise<void>;
}) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo('');
      setDescricao('');
    }
  }, [open]);

  async function salvar() {
    setSalvando(true);
    try {
      await onCriar(titulo, descricao);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Novo épico</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} fullWidth autoFocus />
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={salvar} disabled={!titulo.trim() || salvando}>
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function NovaHistoriaDialog({
  open,
  epicoIdInicial,
  epicos,
  onClose,
  onCriar,
}: {
  open: boolean;
  epicoIdInicial: number | null;
  epicos: Epico[];
  onClose: () => void;
  onCriar: (historia: NovaHistoria) => Promise<void>;
}) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [criteriosAceitacao, setCriteriosAceitacao] = useState('');
  const [pontos, setPontos] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [epicoId, setEpicoId] = useState<number | ''>('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo('');
      setDescricao('');
      setCriteriosAceitacao('');
      setPontos('');
      setPrioridade('MEDIA');
      setEpicoId(epicoIdInicial ?? '');
    }
  }, [open, epicoIdInicial]);

  async function salvar() {
    setSalvando(true);
    try {
      await onCriar({
        titulo,
        descricao,
        criteriosAceitacao: criteriosAceitacao || null,
        pontos: pontos ? Number(pontos) : null,
        prioridade,
        epicoId: epicoId === '' ? null : epicoId,
        sprintId: null,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nova história de usuário</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} fullWidth autoFocus />
          <TextField
            label="Descrição"
            placeholder="Como um <papel>, eu quero <funcionalidade>, para que <motivo>"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Critérios de aceitação"
            value={criteriosAceitacao}
            onChange={(e) => setCriteriosAceitacao(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Pontos"
              type="number"
              value={pontos}
              onChange={(e) => setPontos(e.target.value)}
              fullWidth
            />
            <TextField select label="Prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value)} fullWidth>
              <MenuItem value="BAIXA">Baixa</MenuItem>
              <MenuItem value="MEDIA">Média</MenuItem>
              <MenuItem value="ALTA">Alta</MenuItem>
            </TextField>
            <TextField
              select
              label="Épico"
              value={epicoId}
              onChange={(e) => setEpicoId(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">Nenhum</MenuItem>
              {epicos.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.titulo}
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
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
