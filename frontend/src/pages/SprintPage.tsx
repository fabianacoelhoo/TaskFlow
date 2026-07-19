import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { PageHeader } from '../components/PageHeader';
import {
  analisarProgressoSprintComIA,
  atualizarHistoria,
  concluirSprint,
  gerarRetrospectivaSprintComIA,
  iniciarSprint,
  listarHistorias,
  listarSprints,
  listarTarefasPorProjeto,
  obterBurndown,
  obterVelocidade,
  type NovaHistoria,
} from '../api/resources';
import type {
  AnaliseProgressoSprint,
  Burndown,
  DocumentoProjeto,
  HistoriaUsuario,
  Sprint,
  StatusHistoria,
  Tarefa,
  VelocidadeItem,
} from '../api/types';
import { STATUS_COLOR } from '../theme/status';
import { palette } from '../theme/theme';

const STATUS_HISTORIA_ORDER: StatusHistoria[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'];

const STATUS_HISTORIA_LABEL: Record<StatusHistoria, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
};

const STATUS_HISTORIA_COLOR: Record<StatusHistoria, string> = {
  PENDENTE: STATUS_COLOR.A_FAZER,
  EM_ANDAMENTO: STATUS_COLOR.EM_ANDAMENTO,
  CONCLUIDA: STATUS_COLOR.CONCLUIDO,
};

const SITUACAO_SEVERITY: Record<AnaliseProgressoSprint['situacao'], 'success' | 'warning' | 'error'> = {
  NO_RITMO: 'success',
  ATENCAO: 'warning',
  ATRASADA: 'error',
};

export function SprintPage() {
  const { id, sprintId } = useParams();
  const projetoId = Number(id);
  const sprintIdNum = Number(sprintId);
  const navigate = useNavigate();

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [historias, setHistorias] = useState<HistoriaUsuario[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [burndown, setBurndown] = useState<Burndown | null>(null);
  const [velocidade, setVelocidade] = useState<VelocidadeItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [analisandoRitmo, setAnalisandoRitmo] = useState(false);
  const [resultadoRitmo, setResultadoRitmo] = useState<AnaliseProgressoSprint | null>(null);
  const [erroRitmo, setErroRitmo] = useState<string | null>(null);

  const [gerandoRetro, setGerandoRetro] = useState(false);
  const [retroGerada, setRetroGerada] = useState<DocumentoProjeto | null>(null);
  const [erroRetro, setErroRetro] = useState<string | null>(null);

  function carregar() {
    Promise.all([
      listarSprints(projetoId),
      listarHistorias(projetoId),
      listarTarefasPorProjeto(projetoId),
      obterBurndown(sprintIdNum),
      obterVelocidade(projetoId),
    ]).then(([sprints, historiasCarregadas, tarefasCarregadas, burndownCarregado, velocidadeCarregada]) => {
      setSprint(sprints.find((s) => s.id === sprintIdNum) ?? null);
      setHistorias(historiasCarregadas.filter((h) => h.sprintId === sprintIdNum));
      setTarefas(tarefasCarregadas);
      setBurndown(burndownCarregado);
      setVelocidade(velocidadeCarregada);
      setCarregando(false);
    });
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId, sprintIdNum]);

  const tarefasPorHistoria = useMemo(() => {
    const mapa = new Map<number, Tarefa[]>();
    tarefas.forEach((t) => {
      if (t.historiaUsuarioId === null) return;
      mapa.set(t.historiaUsuarioId, [...(mapa.get(t.historiaUsuarioId) ?? []), t]);
    });
    return mapa;
  }, [tarefas]);

  const colunas = useMemo(() => {
    const grupos: Record<StatusHistoria, HistoriaUsuario[]> = { PENDENTE: [], EM_ANDAMENTO: [], CONCLUIDA: [] };
    historias.forEach((h) => grupos[h.status].push(h));
    return grupos;
  }, [historias]);

  const dadosGrafico = useMemo(() => {
    if (!burndown) return [];
    const mapaReal = new Map(burndown.real.map((p) => [p.data, p.pontos]));
    return burndown.linhaIdeal.map((p) => ({
      data: p.data.slice(5),
      ideal: p.pontos,
      real: mapaReal.has(p.data) ? mapaReal.get(p.data) : null,
    }));
  }, [burndown]);

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const novoStatus = destination.droppableId as StatusHistoria;
    const historia = historias.find((h) => String(h.id) === draggableId);
    if (!historia) return;

    setHistorias((atual) => atual.map((h) => (h.id === historia.id ? { ...h, status: novoStatus } : h)));

    const payload: NovaHistoria = {
      titulo: historia.titulo,
      descricao: historia.descricao,
      criteriosAceitacao: historia.criteriosAceitacao,
      pontos: historia.pontos,
      prioridade: historia.prioridade ?? 'MEDIA',
      status: novoStatus,
      epicoId: historia.epicoId,
      sprintId: historia.sprintId,
    };
    await atualizarHistoria(historia.id, payload);
    carregar();
  }

  async function handleIniciar() {
    await iniciarSprint(sprintIdNum);
    carregar();
  }

  async function handleConcluir() {
    await concluirSprint(sprintIdNum);
    carregar();
  }

  async function handleAnalisarProgresso() {
    setAnalisandoRitmo(true);
    setErroRitmo(null);
    try {
      const resultado = await analisarProgressoSprintComIA(sprintIdNum);
      setResultadoRitmo(resultado);
    } catch (err: any) {
      setErroRitmo(err?.response?.data?.erro ?? 'Não foi possível analisar o ritmo da sprint agora.');
    } finally {
      setAnalisandoRitmo(false);
    }
  }

  async function handleGerarRetrospectiva() {
    setGerandoRetro(true);
    setErroRetro(null);
    try {
      const documento = await gerarRetrospectivaSprintComIA(sprintIdNum);
      setRetroGerada(documento);
    } catch (err: any) {
      setErroRetro(err?.response?.data?.erro ?? 'Não foi possível gerar a retrospectiva agora.');
    } finally {
      setGerandoRetro(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <IconButton size="small" onClick={() => navigate(`/projetos/${projetoId}/backlog`)}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="overline" sx={{ color: 'accentGold.main' }}>
          Sprint
        </Typography>
      </Stack>

      <PageHeader
        title={sprint?.nome ?? 'Carregando...'}
        subtitle={sprint?.objetivo ?? undefined}
        action={
          sprint?.status === 'PLANEJADA' ? (
            <Button variant="contained" startIcon={<BoltRoundedIcon />} onClick={handleIniciar}>
              Iniciar sprint
            </Button>
          ) : sprint?.status === 'ATIVA' ? (
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={handleAnalisarProgresso}
                disabled={analisandoRitmo}
              >
                {analisandoRitmo ? 'Analisando...' : 'Analisar ritmo com IA'}
              </Button>
              <Button variant="contained" onClick={handleConcluir}>
                Concluir sprint
              </Button>
            </Stack>
          ) : sprint?.status === 'CONCLUIDA' ? (
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={handleGerarRetrospectiva}
              disabled={gerandoRetro || retroGerada !== null}
            >
              {gerandoRetro ? 'Gerando...' : retroGerada ? 'Retrospectiva gerada' : 'Gerar retrospectiva com IA'}
            </Button>
          ) : undefined
        }
      />

      {resultadoRitmo && (
        <Alert
          severity={SITUACAO_SEVERITY[resultadoRitmo.situacao]}
          sx={{ mb: 2.5 }}
          onClose={() => setResultadoRitmo(null)}
        >
          {resultadoRitmo.mensagem}
        </Alert>
      )}
      {erroRitmo && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErroRitmo(null)}>
          {erroRitmo}
        </Alert>
      )}
      {retroGerada && (
        <Alert
          severity="success"
          sx={{ mb: 2.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(`/projetos/${projetoId}/documentacao?documentoId=${retroGerada.id}`)}
            >
              Ver retrospectiva
            </Button>
          }
        >
          Retrospectiva gerada e salva na Documentação.
        </Alert>
      )}
      {erroRetro && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErroRetro(null)}>
          {erroRetro}
        </Alert>
      )}

      {carregando ? (
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      ) : (
        <Stack spacing={3}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="flex-start">
              {STATUS_HISTORIA_ORDER.map((status) => (
                <Box
                  key={status}
                  sx={{ flex: 1, width: '100%', bgcolor: 'rgba(15,28,46,0.03)', borderRadius: 4, p: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_HISTORIA_COLOR[status] }} />
                    <Typography variant="subtitle2">{STATUS_HISTORIA_LABEL[status]}</Typography>
                    <Chip
                      label={colunas[status].length}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(15,28,46,0.06)' }}
                    />
                  </Stack>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <Stack
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        spacing={1.5}
                        sx={{
                          minHeight: 80,
                          p: 1,
                          borderRadius: 3,
                          bgcolor: snapshot.isDraggingOver ? 'rgba(176,141,79,0.08)' : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {colunas[status].map((historia, index) => (
                          <Draggable key={historia.id} draggableId={String(historia.id)} index={index}>
                            {(providedDrag) => (
                              <Box ref={providedDrag.innerRef} {...providedDrag.draggableProps} {...providedDrag.dragHandleProps}>
                                <Card elevation={0}>
                                  <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {historia.titulo}
                                    </Typography>
                                    {historia.pontos !== null && (
                                      <Chip
                                        label={`${historia.pontos} pts`}
                                        size="small"
                                        sx={{ height: 18, fontSize: '0.65rem', mb: 0.75 }}
                                      />
                                    )}
                                    {(tarefasPorHistoria.get(historia.id) ?? []).map((t) => (
                                      <Typography
                                        key={t.id}
                                        variant="caption"
                                        sx={{ display: 'block', color: palette.slateLight }}
                                      >
                                        • {t.titulo}
                                      </Typography>
                                    ))}
                                  </CardContent>
                                </Card>
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colunas[status].length === 0 && (
                          <Typography variant="body2" sx={{ textAlign: 'center', color: palette.slateLight, py: 2 }}>
                            Nenhuma história
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Droppable>
                </Box>
              ))}
            </Stack>
          </DragDropContext>

          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Burndown</Typography>
                <Typography variant="body2">
                  Pontos restantes na sprint, dia a dia, comparados com o ritmo ideal.
                </Typography>
              </Stack>

              {dadosGrafico.length === 0 ? (
                <Typography variant="body2" sx={{ py: 4, textAlign: 'center' }}>
                  Sem dados de burndown ainda.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dadosGrafico} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                    <CartesianGrid stroke={palette.line} vertical={false} />
                    <XAxis
                      dataKey="data"
                      tick={{ fill: palette.slate, fontSize: 11 }}
                      axisLine={{ stroke: palette.line }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: palette.slate, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <ChartTooltip
                      contentStyle={{ borderRadius: 10, border: `1px solid ${palette.line}`, fontSize: 13 }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      name="Linha ideal"
                      stroke={palette.slateLight}
                      strokeDasharray="6 4"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="real"
                      name="Pontos restantes"
                      stroke={palette.gold}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {velocidade.length > 0 && (
            <Card elevation={0}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Velocidade da equipe
                </Typography>
                <Stack spacing={1}>
                  {velocidade.map((v) => (
                    <Stack key={v.sprintId} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{v.sprintNome}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {v.pontosConcluidos} pts
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Box>
  );
}
