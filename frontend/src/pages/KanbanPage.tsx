import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { TaskCard } from '../components/TaskCard';
import { TaskFormDialog, type DadosIniciaisTarefa } from '../components/TaskFormDialog';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import { GerarTarefasIADialog } from '../components/GerarTarefasIADialog';
import { CriarTarefaIADialog } from '../components/CriarTarefaIADialog';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import { IntegracaoGithubDialog } from '../components/IntegracaoGithubDialog';
import { CalendarView } from '../components/calendar/CalendarView';
import {
  adicionarMembroProjeto,
  analisarRiscosComIA,
  atualizarTarefa,
  listarHistorias,
  listarProjetos,
  listarTarefasPorProjeto,
  listarUsuarios,
  removerMembroProjeto,
} from '../api/resources';
import type { HistoriaUsuario, Projeto, StatusTarefa, Tarefa, Usuario } from '../api/types';
import { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER } from '../theme/status';
import { palette } from '../theme/theme';
import { useAuth } from '../auth/AuthContext';

export function KanbanPage() {
  const { id } = useParams();
  const projetoId = Number(id);
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [historias, setHistorias] = useState<HistoriaUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [statusNovaTarefa, setStatusNovaTarefa] = useState<StatusTarefa>('A_FAZER');
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [erroArraste, setErroArraste] = useState<string | null>(null);
  const [dialogIaAberto, setDialogIaAberto] = useState(false);
  const [dialogCriarIaAberto, setDialogCriarIaAberto] = useState(false);
  const [dadosIniciaisIA, setDadosIniciaisIA] = useState<DadosIniciaisTarefa | null>(null);
  const [visualizacao, setVisualizacao] = useState<'quadro' | 'calendario'>('quadro');
  const [analisandoRiscos, setAnalisandoRiscos] = useState(false);
  const [mensagemRiscos, setMensagemRiscos] = useState<string | null>(null);
  const [dialogGithubAberto, setDialogGithubAberto] = useState(false);

  function carregar() {
    Promise.all([listarTarefasPorProjeto(projetoId), listarUsuarios(), listarHistorias(projetoId)]).then(
      ([tarefasCarregadas, usuariosCarregados, historiasCarregadas]) => {
        setTarefas(tarefasCarregadas);
        setUsuarios(usuariosCarregados);
        setHistorias(historiasCarregadas);
        setCarregando(false);
      },
    );
  }

  useEffect(() => {
    listarProjetos().then((lista) => {
      setProjeto(lista.find((p) => p.id === projetoId) ?? null);
    });
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId]);

  useEffect(() => {
    const tarefaIdParam = searchParams.get('tarefaId');
    if (!tarefaIdParam || tarefas.length === 0) return;

    const tarefa = tarefas.find((t) => t.id === Number(tarefaIdParam));
    if (tarefa) {
      setTarefaSelecionada(tarefa);
    }
    searchParams.delete('tarefaId');
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarefas]);

  const usuariosPorId = useMemo(() => {
    const mapa = new Map<number, Usuario>();
    usuarios.forEach((u) => mapa.set(u.id, u));
    return mapa;
  }, [usuarios]);

  const podeGerenciarMembros =
    usuario?.papel === 'ADMIN' || (projeto != null && projeto.criadoPorId === usuario?.id);

  const membrosDisponiveis = useMemo(() => {
    const idsAtuais = new Set((projeto?.membros ?? []).map((m) => m.id));
    return usuarios.filter((u) => !idsAtuais.has(u.id));
  }, [usuarios, projeto]);

  async function handleAdicionarMembro(usuarioId: number) {
    const atualizado = await adicionarMembroProjeto(projetoId, usuarioId);
    setProjeto(atualizado);
  }

  async function handleRemoverMembro(usuarioId: number) {
    const atualizado = await removerMembroProjeto(projetoId, usuarioId);
    setProjeto(atualizado);
  }

  async function handleAnalisarRiscos() {
    setAnalisandoRiscos(true);
    try {
      const resultado = await analisarRiscosComIA(projetoId);
      setMensagemRiscos(
        resultado.alertasGerados > 0
          ? `${resultado.alertasGerados} alerta(s) de risco gerado(s). Veja no sino de notificações.`
          : 'Nenhum risco identificado no momento.',
      );
    } catch (err: any) {
      setMensagemRiscos(err?.response?.data?.erro ?? 'Não foi possível analisar riscos agora.');
    } finally {
      setAnalisandoRiscos(false);
    }
  }

  const colunas = useMemo(() => {
    const grupos: Record<StatusTarefa, Tarefa[]> = {
      A_FAZER: [],
      EM_ANDAMENTO: [],
      CONCLUIDO: [],
    };
    tarefas.forEach((t) => grupos[t.status].push(t));
    return grupos;
  }, [tarefas]);

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const novoStatus = destination.droppableId as StatusTarefa;
    const tarefa = tarefas.find((t) => String(t.id) === draggableId);
    if (!tarefa) return;

    const anteriores = tarefas;
    setTarefas((atual) =>
      atual.map((t) => (t.id === tarefa.id ? { ...t, status: novoStatus } : t)),
    );

    try {
      await atualizarTarefa(tarefa.id, {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        status: novoStatus,
        prioridade: tarefa.prioridade ?? 'MEDIA',
        prazo: tarefa.prazo,
        tagIds: tarefa.tags.map((t) => t.id),
        dependenciaIds: tarefa.dependencias.map((d) => d.id),
        historiaUsuarioId: tarefa.historiaUsuarioId,
      });
    } catch (erro: any) {
      setTarefas(anteriores);
      setErroArraste(erro?.response?.data?.erro ?? 'Não foi possível mover a tarefa.');
    }
  }

  function abrirNovaTarefa(status: StatusTarefa) {
    setTarefaEditando(null);
    setDadosIniciaisIA(null);
    setStatusNovaTarefa(status);
    setDialogAberto(true);
  }

  function abrirEdicao(tarefa: Tarefa) {
    setTarefaEditando(tarefa);
    setDadosIniciaisIA(null);
    setStatusNovaTarefa(tarefa.status);
    setDialogAberto(true);
    setTarefaSelecionada(null);
  }

  function handleTarefaInterpretada(dados: DadosIniciaisTarefa) {
    setDialogCriarIaAberto(false);
    setTarefaEditando(null);
    setDadosIniciaisIA(dados);
    setStatusNovaTarefa('A_FAZER');
    setDialogAberto(true);
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <IconButton size="small" onClick={() => navigate('/projetos')}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="overline" sx={{ color: 'accentGold.main' }}>
          Projeto
        </Typography>
      </Stack>

      <PageHeader
        title={projeto?.nome ?? 'Carregando...'}
        subtitle={projeto?.descricao}
        action={
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<ReportProblemRoundedIcon />}
              onClick={handleAnalisarRiscos}
              disabled={analisandoRiscos}
            >
              {analisandoRiscos ? 'Analisando...' : 'Analisar riscos'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssignmentTurnedInRoundedIcon />}
              onClick={() => navigate(`/projetos/${projetoId}/backlog`)}
            >
              Backlog & Sprints
            </Button>
            <Button
              variant="outlined"
              startIcon={<RuleRoundedIcon />}
              onClick={() => navigate(`/projetos/${projetoId}/automacoes`)}
            >
              Automações
            </Button>
            <Button
              variant="outlined"
              startIcon={<DescriptionRoundedIcon />}
              onClick={() => navigate(`/projetos/${projetoId}/documentacao`)}
            >
              Documentação
            </Button>
            <Button variant="outlined" startIcon={<GitHubIcon />} onClick={() => setDialogGithubAberto(true)}>
              GitHub
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditNoteRoundedIcon />}
              onClick={() => setDialogCriarIaAberto(true)}
            >
              Criar tarefa por texto
            </Button>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={() => setDialogIaAberto(true)}
            >
              Gerar tarefas com IA
            </Button>
          </Stack>
        }
      />

      {projeto && (
        <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1} sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ color: palette.slateLight, fontWeight: 600 }}>
            Membros:
          </Typography>
          {projeto.membros.map((membro) => (
            <Chip
              key={membro.id}
              size="small"
              avatar={
                <Avatar sx={{ bgcolor: palette.ink, color: palette.ivory, fontSize: '0.65rem' }}>
                  {membro.nome.slice(0, 1).toUpperCase()}
                </Avatar>
              }
              label={membro.nome}
              onDelete={
                podeGerenciarMembros && membro.id !== projeto.criadoPorId
                  ? () => handleRemoverMembro(membro.id)
                  : undefined
              }
            />
          ))}
          {podeGerenciarMembros && membrosDisponiveis.length > 0 && (
            <Select
              size="small"
              displayEmpty
              value=""
              onChange={(e) => handleAdicionarMembro(Number(e.target.value))}
              renderValue={() => (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <PersonAddRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Adicionar</span>
                </Stack>
              )}
              sx={{ minWidth: 140, height: 32, fontSize: '0.8rem' }}
            >
              {membrosDisponiveis.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.nome}
                </MenuItem>
              ))}
            </Select>
          )}
        </Stack>
      )}

      {!carregando && (
        <ToggleButtonGroup
          value={visualizacao}
          exclusive
          onChange={(_, valor) => valor && setVisualizacao(valor)}
          size="small"
          sx={{ mb: 2.5 }}
        >
          <ToggleButton value="quadro" sx={{ px: 2, gap: 0.75 }}>
            <ViewKanbanRoundedIcon sx={{ fontSize: 17 }} />
            Quadro
          </ToggleButton>
          <ToggleButton value="calendario" sx={{ px: 2, gap: 0.75 }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />
            Calendário
          </ToggleButton>
        </ToggleButtonGroup>
      )}

      {carregando ? (
        <Stack direction="row" spacing={2.5}>
          {STATUS_ORDER.map((s) => (
            <Skeleton key={s} variant="rounded" height={400} sx={{ flex: 1, borderRadius: 4 }} />
          ))}
        </Stack>
      ) : visualizacao === 'calendario' ? (
        <CalendarView
          tarefas={tarefas}
          usuariosPorId={usuariosPorId}
          onSelecionarTarefa={setTarefaSelecionada}
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="flex-start">
            {STATUS_ORDER.map((status) => (
              <Box
                key={status}
                sx={{
                  flex: 1,
                  width: '100%',
                  bgcolor: 'rgba(15,28,46,0.03)',
                  borderRadius: 4,
                  p: 1.5,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 1, py: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: STATUS_COLOR[status],
                      }}
                    />
                    <Typography variant="subtitle2">{STATUS_LABEL[status]}</Typography>
                    <Chip
                      label={colunas[status].length}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(15,28,46,0.06)' }}
                    />
                  </Stack>
                  <IconButton size="small" onClick={() => abrirNovaTarefa(status)}>
                    <AddRoundedIcon fontSize="small" />
                  </IconButton>
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
                      {colunas[status].map((tarefa, index) => (
                        <Draggable key={tarefa.id} draggableId={String(tarefa.id)} index={index}>
                          {(providedDrag) => (
                            <Box
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                            >
                              <TaskCard
                                tarefa={tarefa}
                                responsavel={usuariosPorId.get(tarefa.responsavelId)}
                                onClick={() => setTarefaSelecionada(tarefa)}
                              />
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {colunas[status].length === 0 && (
                        <Typography
                          variant="body2"
                          sx={{ textAlign: 'center', color: palette.slateLight, py: 2 }}
                        >
                          Nenhuma tarefa
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Droppable>
              </Box>
            ))}
          </Stack>
        </DragDropContext>
      )}

      <TaskFormDialog
        open={dialogAberto}
        onClose={() => setDialogAberto(false)}
        onSalvo={carregar}
        projetoId={projetoId}
        usuarios={usuarios}
        tarefasDoProjeto={tarefas}
        historias={historias}
        statusInicial={statusNovaTarefa}
        tarefaExistente={tarefaEditando}
        dadosIniciais={dadosIniciaisIA}
      />

      <CriarTarefaIADialog
        open={dialogCriarIaAberto}
        onClose={() => setDialogCriarIaAberto(false)}
        projetoId={projetoId}
        onInterpretado={handleTarefaInterpretada}
      />

      <TaskDetailDrawer
        tarefa={tarefaSelecionada}
        responsavel={tarefaSelecionada ? usuariosPorId.get(tarefaSelecionada.responsavelId) : undefined}
        onClose={() => setTarefaSelecionada(null)}
        onEditar={() => tarefaSelecionada && abrirEdicao(tarefaSelecionada)}
        onExcluida={() => {
          setTarefaSelecionada(null);
          carregar();
        }}
      />

      <GerarTarefasIADialog
        open={dialogIaAberto}
        onClose={() => setDialogIaAberto(false)}
        onGerado={carregar}
        projetoId={projetoId}
        usuarios={usuarios}
      />

      <IntegracaoGithubDialog
        open={dialogGithubAberto}
        onClose={() => setDialogGithubAberto(false)}
        projetoId={projetoId}
        podeGerenciar={podeGerenciarMembros}
      />

      <Snackbar
        open={Boolean(erroArraste)}
        autoHideDuration={5000}
        onClose={() => setErroArraste(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErroArraste(null)} sx={{ maxWidth: 480 }}>
          {erroArraste}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(mensagemRiscos)}
        autoHideDuration={6000}
        onClose={() => setMensagemRiscos(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setMensagemRiscos(null)} sx={{ maxWidth: 480 }}>
          {mensagemRiscos}
        </Alert>
      </Snackbar>
    </Box>
  );
}
