import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import type { HistoriaUsuario, StatusTarefa, Tag, Tarefa, Usuario } from '../api/types';
import {
  criarTarefa,
  atualizarTarefa,
  trocarResponsavel,
  listarTags,
  criarTag,
  sugerirPrazoComIA,
  sugerirResponsavelComIA,
} from '../api/resources';
import { STATUS_LABEL, STATUS_ORDER } from '../theme/status';
import { palette } from '../theme/theme';

const CORES_TAG = ['#2a78d6', '#008300', '#B08D4F', '#B3441E', '#5B6472'];

export interface DadosIniciaisTarefa {
  titulo: string;
  descricao: string;
  prioridade: string;
  prazo: string | null;
  responsavelId: number | null;
}

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSalvo: () => void;
  projetoId: number;
  usuarios: Usuario[];
  tarefasDoProjeto: Tarefa[];
  historias: HistoriaUsuario[];
  statusInicial: StatusTarefa;
  tarefaExistente?: Tarefa | null;
  dadosIniciais?: DadosIniciaisTarefa | null;
}

export function TaskFormDialog({
  open,
  onClose,
  onSalvo,
  projetoId,
  usuarios,
  tarefasDoProjeto,
  historias,
  statusInicial,
  tarefaExistente,
  dadosIniciais,
}: TaskFormDialogProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<StatusTarefa>(statusInicial);
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [prazo, setPrazo] = useState('');
  const [responsavelId, setResponsavelId] = useState<number | ''>('');
  const [historiaUsuarioId, setHistoriaUsuarioId] = useState<number | ''>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState<Tag[]>([]);
  const [dependencias, setDependencias] = useState<Tarefa[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [sugerindoPrazo, setSugerindoPrazo] = useState(false);
  const [justificativaPrazo, setJustificativaPrazo] = useState<string | null>(null);
  const [sugerindoResponsavel, setSugerindoResponsavel] = useState(false);
  const [justificativaResponsavel, setJustificativaResponsavel] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      listarTags().then(setTagsDisponiveis);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (tarefaExistente) {
      setTitulo(tarefaExistente.titulo);
      setDescricao(tarefaExistente.descricao ?? '');
      setStatus(tarefaExistente.status);
      setPrioridade(tarefaExistente.prioridade ?? 'MEDIA');
      setPrazo(tarefaExistente.prazo ?? '');
      setResponsavelId(tarefaExistente.responsavelId);
      setHistoriaUsuarioId(tarefaExistente.historiaUsuarioId ?? '');
      setTags(tarefaExistente.tags);
      setDependencias(
        tarefasDoProjeto.filter((t) =>
          tarefaExistente.dependencias.some((d) => d.id === t.id),
        ),
      );
    } else if (dadosIniciais) {
      setTitulo(dadosIniciais.titulo);
      setDescricao(dadosIniciais.descricao);
      setStatus(statusInicial);
      setPrioridade(dadosIniciais.prioridade);
      setPrazo(dadosIniciais.prazo ?? '');
      setResponsavelId(dadosIniciais.responsavelId ?? usuarios[0]?.id ?? '');
      setHistoriaUsuarioId('');
      setTags([]);
      setDependencias([]);
    } else {
      setTitulo('');
      setDescricao('');
      setStatus(statusInicial);
      setPrioridade('MEDIA');
      setPrazo('');
      setResponsavelId(usuarios[0]?.id ?? '');
      setHistoriaUsuarioId('');
      setTags([]);
      setDependencias([]);
    }
    setJustificativaPrazo(null);
    setJustificativaResponsavel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tarefaExistente, dadosIniciais, statusInicial, usuarios]);

  async function sugerirPrazo() {
    if (!titulo.trim() || responsavelId === '') return;
    setSugerindoPrazo(true);
    setJustificativaPrazo(null);
    try {
      const sugestao = await sugerirPrazoComIA(titulo, prioridade, responsavelId as number);
      setPrazo(sugestao.prazo);
      setJustificativaPrazo(sugestao.justificativa);
    } catch {
      setJustificativaPrazo('Não foi possível sugerir um prazo agora.');
    } finally {
      setSugerindoPrazo(false);
    }
  }

  async function sugerirResponsavel() {
    if (!titulo.trim()) return;
    setSugerindoResponsavel(true);
    setJustificativaResponsavel(null);
    try {
      const sugestao = await sugerirResponsavelComIA(projetoId, titulo, descricao);
      setResponsavelId(sugestao.responsavelId);
      setJustificativaResponsavel(`${sugestao.nomeResponsavel}: ${sugestao.justificativa}`);
    } catch {
      setJustificativaResponsavel('Não foi possível sugerir um responsável agora.');
    } finally {
      setSugerindoResponsavel(false);
    }
  }

  async function handleNovaTag(nome: string) {
    const cor = CORES_TAG[tagsDisponiveis.length % CORES_TAG.length];
    const tag = await criarTag(nome, cor);
    setTagsDisponiveis((atual) => [...atual, tag]);
    setTags((atual) => [...atual, tag]);
  }

  async function salvar() {
    if (!titulo.trim() || responsavelId === '') return;
    setSalvando(true);

    const dto = {
      titulo,
      descricao,
      status,
      prioridade,
      prazo: prazo || null,
      tagIds: tags.map((t) => t.id),
      dependenciaIds: dependencias.map((d) => d.id),
      historiaUsuarioId: historiaUsuarioId === '' ? null : historiaUsuarioId,
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

  const opcoesDependencia = tarefasDoProjeto.filter((t) => t.id !== tarefaExistente?.id);

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

          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              label="Prazo"
              type="date"
              value={prazo}
              onChange={(e) => {
                setPrazo(e.target.value);
                setJustificativaPrazo(null);
              }}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Tooltip title="Sugerir prazo com IA">
              <span>
                <IconButton
                  aria-label="Sugerir prazo com IA"
                  onClick={sugerirPrazo}
                  disabled={!titulo.trim() || responsavelId === '' || sugerindoPrazo}
                  sx={{
                    mt: 0.5,
                    bgcolor: 'rgba(176,141,79,0.12)',
                    color: palette.gold,
                    '&:hover': { bgcolor: 'rgba(176,141,79,0.22)' },
                  }}
                >
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

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

            <Tooltip title="Sugerir responsável com IA">
              <span>
                <IconButton
                  aria-label="Sugerir responsável com IA"
                  onClick={sugerirResponsavel}
                  disabled={!titulo.trim() || sugerindoResponsavel}
                  sx={{
                    mt: 0.5,
                    bgcolor: 'rgba(176,141,79,0.12)',
                    color: palette.gold,
                    '&:hover': { bgcolor: 'rgba(176,141,79,0.22)' },
                  }}
                >
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <TextField
            select
            label="História vinculada"
            value={historiaUsuarioId}
            onChange={(e) => setHistoriaUsuarioId(e.target.value === '' ? '' : Number(e.target.value))}
            fullWidth
          >
            <MenuItem value="">Nenhuma</MenuItem>
            {historias.map((h) => (
              <MenuItem key={h.id} value={h.id}>
                {h.titulo}
              </MenuItem>
            ))}
          </TextField>

          {(sugerindoPrazo || justificativaPrazo) && (
            <Typography
              variant="caption"
              sx={{ color: palette.slate, display: 'flex', alignItems: 'center', gap: 0.5, mt: -1.5 }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: palette.gold }} />
              {sugerindoPrazo ? 'Analisando a carga de trabalho...' : justificativaPrazo}
            </Typography>
          )}

          {(sugerindoResponsavel || justificativaResponsavel) && (
            <Typography
              variant="caption"
              sx={{ color: palette.slate, display: 'flex', alignItems: 'center', gap: 0.5, mt: -1.5 }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: palette.gold }} />
              {sugerindoResponsavel ? 'Avaliando cargo, habilidades e disponibilidade da equipe...' : justificativaResponsavel}
            </Typography>
          )}

          <Autocomplete
            multiple
            freeSolo
            options={tagsDisponiveis}
            value={tags}
            getOptionLabel={(opcao) => (typeof opcao === 'string' ? opcao : opcao.nome)}
            isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
            onChange={(_, novoValor) => {
              const novaLista: Tag[] = [];
              novoValor.forEach((item) => {
                if (typeof item === 'string') {
                  handleNovaTag(item);
                } else {
                  novaLista.push(item);
                }
              });
              setTags(novaLista);
            }}
            renderTags={(valor, getTagProps) =>
              valor.map((tag, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={tag.id}
                  label={tag.nome}
                  size="small"
                  sx={{ bgcolor: `${tag.cor}1A`, color: tag.cor, fontWeight: 600 }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Tags" placeholder="Digite e pressione Enter para criar" />
            )}
          />

          <Autocomplete
            multiple
            options={opcoesDependencia}
            value={dependencias}
            getOptionLabel={(t) => t.titulo}
            isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
            onChange={(_, novoValor) => setDependencias(novoValor)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Depende de"
                placeholder="Tarefas que precisam ser concluídas antes"
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.titulo}
                {option.status !== 'CONCLUIDO' && (
                  <Chip
                    label="pendente"
                    size="small"
                    sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: palette.line }}
                  />
                )}
              </li>
            )}
          />
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
