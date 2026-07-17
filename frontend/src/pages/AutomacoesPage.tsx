import { useEffect, useState } from 'react';
import {
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
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { useAuth } from '../auth/AuthContext';
import {
  atualizarAutomacao,
  criarAutomacao,
  excluirAutomacao,
  listarAutomacoes,
  listarProjetos,
  listarTags,
  type NovaAcaoAutomacao,
  type NovaRegraAutomacao,
} from '../api/resources';
import type { Projeto, RegraAutomacao, StatusTarefa, Tag, TipoAcaoAutomacao } from '../api/types';
import { STATUS_LABEL, STATUS_ORDER } from '../theme/status';
import { palette } from '../theme/theme';

const TIPO_ACAO_LABEL: Record<TipoAcaoAutomacao, string> = {
  NOTIFICAR_RESPONSAVEL: 'Notificar responsável',
  NOTIFICAR_MEMBROS_PROJETO: 'Notificar membros do projeto',
  MOVER_PARA_STATUS: 'Mover para status',
  ADICIONAR_TAG: 'Adicionar tag',
};

function descreverAcao(acao: { tipo: TipoAcaoAutomacao; statusDestino: StatusTarefa | null; tagNome: string | null }) {
  if (acao.tipo === 'MOVER_PARA_STATUS' && acao.statusDestino) {
    return `Mover para ${STATUS_LABEL[acao.statusDestino]}`;
  }
  if (acao.tipo === 'ADICIONAR_TAG' && acao.tagNome) {
    return `Adicionar tag "${acao.tagNome}"`;
  }
  return TIPO_ACAO_LABEL[acao.tipo];
}

function regraParaPayload(regra: RegraAutomacao): NovaRegraAutomacao {
  return {
    nome: regra.nome,
    statusGatilho: regra.statusGatilho,
    ativa: regra.ativa,
    acoes: regra.acoes.map((a) => ({
      tipo: a.tipo,
      mensagem: a.mensagem,
      statusDestino: a.statusDestino,
      tagId: a.tagId,
    })),
  };
}

export function AutomacoesPage() {
  const { id } = useParams();
  const projetoId = Number(id);
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [regras, setRegras] = useState<RegraAutomacao[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);

  const podeGerenciar = usuario?.papel === 'ADMIN' || (projeto != null && projeto.criadoPorId === usuario?.id);

  function carregar() {
    setCarregando(true);
    Promise.all([listarAutomacoes(projetoId), listarTags()]).then(([regrasCarregadas, tagsCarregadas]) => {
      setRegras(regrasCarregadas);
      setTags(tagsCarregadas);
      setCarregando(false);
    });
  }

  useEffect(() => {
    listarProjetos().then((lista) => setProjeto(lista.find((p) => p.id === projetoId) ?? null));
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId]);

  async function handleAlternarAtiva(regra: RegraAutomacao) {
    await atualizarAutomacao(regra.id, { ...regraParaPayload(regra), ativa: !regra.ativa });
    carregar();
  }

  async function handleExcluir(regra: RegraAutomacao) {
    if (!window.confirm(`Excluir a regra "${regra.nome}"?`)) return;
    await excluirAutomacao(regra.id);
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
        title="Automações"
        subtitle='Regras do tipo "quando uma tarefa mudar para um status, faça isto automaticamente".'
        action={
          podeGerenciar ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogAberto(true)}>
              Nova regra
            </Button>
          ) : undefined
        }
      />

      {!carregando && regras.length === 0 && (
        <Box sx={{ border: `1px dashed ${palette.line}`, borderRadius: 4, py: 6, textAlign: 'center' }}>
          <RuleRoundedIcon sx={{ fontSize: 28, color: palette.slateLight, mb: 1 }} />
          <Typography variant="body2" sx={{ color: palette.slateLight }}>
            Nenhuma automação configurada ainda.
          </Typography>
        </Box>
      )}

      <Stack spacing={1.5}>
        {regras.map((regra, i) => (
          <Reveal key={regra.id} delay={(i % 6) * 0.05}>
            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {regra.nome}
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      <Chip
                        label={`Quando: ${STATUS_LABEL[regra.statusGatilho]}`}
                        size="small"
                        sx={{ bgcolor: 'rgba(176,141,79,0.14)', color: palette.gold, fontWeight: 600 }}
                      />
                      {regra.acoes.map((acao) => (
                        <Chip key={acao.id} label={descreverAcao(acao)} size="small" />
                      ))}
                    </Stack>
                  </Box>
                  {podeGerenciar && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Switch checked={regra.ativa} onChange={() => handleAlternarAtiva(regra)} size="small" />
                      <IconButton size="small" onClick={() => handleExcluir(regra)}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </Stack>

      <NovaRegraDialog
        open={dialogAberto}
        tags={tags}
        onClose={() => setDialogAberto(false)}
        onCriar={async (regra) => {
          await criarAutomacao(projetoId, regra);
          setDialogAberto(false);
          carregar();
        }}
      />
    </Box>
  );
}

function acaoVazia(): NovaAcaoAutomacao {
  return { tipo: 'NOTIFICAR_RESPONSAVEL', mensagem: '', statusDestino: null, tagId: null };
}

function NovaRegraDialog({
  open,
  tags,
  onClose,
  onCriar,
}: {
  open: boolean;
  tags: Tag[];
  onClose: () => void;
  onCriar: (regra: NovaRegraAutomacao) => Promise<void>;
}) {
  const [nome, setNome] = useState('');
  const [statusGatilho, setStatusGatilho] = useState<StatusTarefa>('CONCLUIDO');
  const [acoes, setAcoes] = useState<NovaAcaoAutomacao[]>([acaoVazia()]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setNome('');
      setStatusGatilho('CONCLUIDO');
      setAcoes([acaoVazia()]);
    }
  }, [open]);

  function atualizarAcao(index: number, campo: Partial<NovaAcaoAutomacao>) {
    setAcoes((atual) => atual.map((a, i) => (i === index ? { ...a, ...campo } : a)));
  }

  function removerAcao(index: number) {
    setAcoes((atual) => atual.filter((_, i) => i !== index));
  }

  async function salvar() {
    setSalvando(true);
    try {
      await onCriar({ nome, statusGatilho, ativa: true, acoes });
    } finally {
      setSalvando(false);
    }
  }

  const valido = nome.trim() !== '' && acoes.every((a) =>
    a.tipo !== 'MOVER_PARA_STATUS' || a.statusDestino !== null,
  ) && acoes.every((a) => a.tipo !== 'ADICIONAR_TAG' || a.tagId !== null);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nova regra de automação</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Nome da regra" value={nome} onChange={(e) => setNome(e.target.value)} fullWidth autoFocus />

          <TextField
            select
            label="Quando a tarefa mudar para"
            value={statusGatilho}
            onChange={(e) => setStatusGatilho(e.target.value as StatusTarefa)}
            fullWidth
          >
            {STATUS_ORDER.map((s) => (
              <MenuItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="subtitle2">Ações</Typography>

          <Stack spacing={1.5}>
            {acoes.map((acao, index) => (
              <Stack key={index} spacing={1.5} sx={{ p: 1.5, border: `1px solid ${palette.line}`, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    select
                    size="small"
                    label="Ação"
                    value={acao.tipo}
                    onChange={(e) => atualizarAcao(index, { tipo: e.target.value as TipoAcaoAutomacao })}
                    fullWidth
                  >
                    {Object.entries(TIPO_ACAO_LABEL).map(([valor, label]) => (
                      <MenuItem key={valor} value={valor}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <IconButton size="small" onClick={() => removerAcao(index)} disabled={acoes.length === 1}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>

                {(acao.tipo === 'NOTIFICAR_RESPONSAVEL' || acao.tipo === 'NOTIFICAR_MEMBROS_PROJETO') && (
                  <TextField
                    size="small"
                    label="Mensagem (opcional)"
                    placeholder="Se vazio, usa uma mensagem padrão"
                    value={acao.mensagem ?? ''}
                    onChange={(e) => atualizarAcao(index, { mensagem: e.target.value })}
                    fullWidth
                  />
                )}

                {acao.tipo === 'MOVER_PARA_STATUS' && (
                  <TextField
                    select
                    size="small"
                    label="Novo status"
                    value={acao.statusDestino ?? ''}
                    onChange={(e) => atualizarAcao(index, { statusDestino: e.target.value as StatusTarefa })}
                    fullWidth
                  >
                    {STATUS_ORDER.map((s) => (
                      <MenuItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {acao.tipo === 'ADICIONAR_TAG' && (
                  <TextField
                    select
                    size="small"
                    label="Tag"
                    value={acao.tagId ?? ''}
                    onChange={(e) => atualizarAcao(index, { tagId: Number(e.target.value) })}
                    fullWidth
                  >
                    {tags.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Stack>
            ))}

            <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setAcoes((a) => [...a, acaoVazia()])} sx={{ alignSelf: 'flex-start' }}>
              Adicionar outra ação
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={salvar} disabled={!valido || salvando}>
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
