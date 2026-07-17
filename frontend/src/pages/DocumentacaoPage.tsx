import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { PageHeader } from '../components/PageHeader';
import {
  atualizarDocumento,
  criarDocumento,
  excluirDocumento,
  gerarDocumentoComIA,
  listarDocumentos,
  listarProjetos,
  type NovoDocumento,
} from '../api/resources';
import type { CategoriaDocumento, DocumentoProjeto, Projeto } from '../api/types';
import { palette } from '../theme/theme';

const CATEGORIA_LABEL: Record<CategoriaDocumento, string> = {
  DOCUMENTACAO_TECNICA: 'Documentação técnica',
  REQUISITOS: 'Requisitos',
  ARQUITETURA: 'Arquitetura',
  BANCO_DE_DADOS: 'Banco de dados',
  REGRAS_DE_NEGOCIO: 'Regras de negócio',
  DECISOES: 'Decisões',
  OUTRO: 'Outro',
};

const CATEGORIA_ORDEM: CategoriaDocumento[] = [
  'DOCUMENTACAO_TECNICA',
  'REQUISITOS',
  'ARQUITETURA',
  'BANCO_DE_DADOS',
  'REGRAS_DE_NEGOCIO',
  'DECISOES',
  'OUTRO',
];

export function DocumentacaoPage() {
  const { id } = useParams();
  const projetoId = Number(id);
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoProjeto[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [conteudoEditando, setConteudoEditando] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [dialogNovoAberto, setDialogNovoAberto] = useState(false);
  const [dialogIaAberto, setDialogIaAberto] = useState(false);

  function carregar(selecionarId?: number) {
    setCarregando(true);
    listarDocumentos(projetoId).then((lista) => {
      setDocumentos(lista);
      if (selecionarId !== undefined) {
        setSelecionadoId(selecionarId);
      } else if (lista.length > 0 && !lista.some((d) => d.id === selecionadoId)) {
        setSelecionadoId(lista[0].id);
      }
      setCarregando(false);
    });
  }

  useEffect(() => {
    listarProjetos().then((lista) => setProjeto(lista.find((p) => p.id === projetoId) ?? null));
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId]);

  const selecionado = documentos.find((d) => d.id === selecionadoId) ?? null;

  const documentosPorCategoria = useMemo(() => {
    const mapa = new Map<CategoriaDocumento, DocumentoProjeto[]>();
    documentos.forEach((d) => mapa.set(d.categoria, [...(mapa.get(d.categoria) ?? []), d]));
    return mapa;
  }, [documentos]);

  function abrirDocumento(doc: DocumentoProjeto) {
    setSelecionadoId(doc.id);
    setEditando(false);
  }

  function iniciarEdicao() {
    if (!selecionado) return;
    setConteudoEditando(selecionado.conteudo);
    setEditando(true);
  }

  async function salvarEdicao() {
    if (!selecionado) return;
    setSalvando(true);
    try {
      await atualizarDocumento(selecionado.id, {
        titulo: selecionado.titulo,
        categoria: selecionado.categoria,
        conteudo: conteudoEditando,
      });
      setEditando(false);
      carregar(selecionado.id);
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(doc: DocumentoProjeto) {
    if (!window.confirm(`Excluir a página "${doc.titulo}"?`)) return;
    await excluirDocumento(doc.id);
    setSelecionadoId(null);
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

      <PageHeader title="Documentação" subtitle="Requisitos, arquitetura, decisões e tudo mais sobre o projeto, em um só lugar." />

      {carregando ? (
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      ) : (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="flex-start">
          <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setDialogNovoAberto(true)} fullWidth>
                Nova página
              </Button>
              <Button size="small" variant="contained" startIcon={<AutoAwesomeRoundedIcon />} onClick={() => setDialogIaAberto(true)} fullWidth>
                Gerar com IA
              </Button>
            </Stack>

            {documentos.length === 0 ? (
              <Typography variant="body2" sx={{ color: palette.slateLight, textAlign: 'center', py: 3 }}>
                Nenhuma página ainda.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {CATEGORIA_ORDEM.filter((c) => documentosPorCategoria.has(c)).map((categoria) => (
                  <Box key={categoria}>
                    <Typography variant="caption" sx={{ color: palette.slateLight, fontWeight: 700, mb: 0.5, display: 'block' }}>
                      {CATEGORIA_LABEL[categoria].toUpperCase()}
                    </Typography>
                    <Stack spacing={0.5}>
                      {(documentosPorCategoria.get(categoria) ?? []).map((doc) => (
                        <Box
                          key={doc.id}
                          onClick={() => abrirDocumento(doc)}
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: doc.id === selecionadoId ? 'rgba(176,141,79,0.12)' : 'transparent',
                            '&:hover': { bgcolor: doc.id === selecionadoId ? 'rgba(176,141,79,0.12)' : 'rgba(15,28,46,0.03)' },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: doc.id === selecionadoId ? 700 : 500 }} noWrap>
                            {doc.titulo}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            {!selecionado ? (
              <Box sx={{ border: `1px dashed ${palette.line}`, borderRadius: 4, py: 8, textAlign: 'center' }}>
                <DescriptionRoundedIcon sx={{ fontSize: 28, color: palette.slateLight, mb: 1 }} />
                <Typography variant="body2" sx={{ color: palette.slateLight }}>
                  Escolha uma página ao lado ou crie uma nova.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 4, p: { xs: 2.5, md: 3.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Chip
                      label={CATEGORIA_LABEL[selecionado.categoria]}
                      size="small"
                      sx={{ bgcolor: 'rgba(176,141,79,0.14)', color: palette.gold, fontWeight: 600, mb: 1 }}
                    />
                    <Typography variant="h5">{selecionado.titulo}</Typography>
                    <Typography variant="caption" sx={{ color: palette.slateLight }}>
                      {selecionado.criadoPorNome ? `Criado por ${selecionado.criadoPorNome}` : ''}
                      {selecionado.atualizadoEm ? ` · atualizado em ${new Date(selecionado.atualizadoEm).toLocaleString('pt-BR')}` : ''}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {editando ? (
                      <Button size="small" variant="contained" onClick={salvarEdicao} disabled={salvando}>
                        {salvando ? 'Salvando...' : 'Salvar'}
                      </Button>
                    ) : (
                      <IconButton size="small" onClick={iniciarEdicao}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleExcluir(selecionado)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>

                {editando ? (
                  <TextField
                    value={conteudoEditando}
                    onChange={(e) => setConteudoEditando(e.target.value)}
                    fullWidth
                    multiline
                    minRows={16}
                    placeholder="Escreva em Markdown..."
                    sx={{ '& textarea': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                  />
                ) : (
                  <Box
                    sx={{
                      '& h1, & h2, & h3': { fontFamily: '"Fraunces", serif' },
                      '& pre': { bgcolor: 'rgba(15,28,46,0.05)', p: 1.5, borderRadius: 2, overflowX: 'auto' },
                      '& code': { fontFamily: 'monospace', fontSize: '0.85em' },
                      '& p, & li': { color: palette.slate, lineHeight: 1.7 },
                    }}
                  >
                    {selecionado.conteudo ? (
                      <ReactMarkdown>{selecionado.conteudo}</ReactMarkdown>
                    ) : (
                      <Typography variant="body2" sx={{ color: palette.slateLight }}>
                        Página vazia. Clique em editar pra começar a escrever.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Stack>
      )}

      <NovaPaginaDialog
        open={dialogNovoAberto}
        onClose={() => setDialogNovoAberto(false)}
        onCriar={async (doc) => {
          const criado = await criarDocumento(projetoId, doc);
          setDialogNovoAberto(false);
          carregar(criado.id);
          setEditando(true);
          setConteudoEditando('');
        }}
      />

      <GerarDocumentoIADialog
        open={dialogIaAberto}
        onClose={() => setDialogIaAberto(false)}
        onGerado={(doc) => {
          setDialogIaAberto(false);
          carregar(doc.id);
        }}
        projetoId={projetoId}
      />
    </Box>
  );
}

function NovaPaginaDialog({
  open,
  onClose,
  onCriar,
}: {
  open: boolean;
  onClose: () => void;
  onCriar: (doc: NovoDocumento) => Promise<void>;
}) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDocumento>('DOCUMENTACAO_TECNICA');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo('');
      setCategoria('DOCUMENTACAO_TECNICA');
    }
  }, [open]);

  async function salvar() {
    setSalvando(true);
    try {
      await onCriar({ titulo, categoria, conteudo: '' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nova página</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} fullWidth autoFocus />
          <TextField select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)} fullWidth>
            {CATEGORIA_ORDEM.map((c) => (
              <MenuItem key={c} value={c}>
                {CATEGORIA_LABEL[c]}
              </MenuItem>
            ))}
          </TextField>
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

function GerarDocumentoIADialog({
  open,
  onClose,
  onGerado,
  projetoId,
}: {
  open: boolean;
  onClose: () => void;
  onGerado: (doc: DocumentoProjeto) => void;
  projetoId: number;
}) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDocumento>('DOCUMENTACAO_TECNICA');
  const [instrucoes, setInstrucoes] = useState('');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitulo('');
      setCategoria('DOCUMENTACAO_TECNICA');
      setInstrucoes('');
      setErro(null);
    }
  }, [open]);

  async function gerar() {
    if (!titulo.trim()) return;
    setGerando(true);
    setErro(null);
    try {
      const doc = await gerarDocumentoComIA(projetoId, titulo, categoria, instrucoes);
      onGerado(doc);
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Não foi possível gerar o documento agora.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <Dialog open={open} onClose={gerando ? undefined : onClose} fullWidth maxWidth="sm">
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
          Gerar página com IA
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Título" placeholder='Ex: "README do projeto"' value={titulo} onChange={(e) => setTitulo(e.target.value)} fullWidth autoFocus disabled={gerando} />
          <TextField select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)} fullWidth disabled={gerando}>
            {CATEGORIA_ORDEM.map((c) => (
              <MenuItem key={c} value={c}>
                {CATEGORIA_LABEL[c]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Instruções (opcional)"
            placeholder="O que deve entrar no documento?"
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={gerando}
          />
          {erro && <Typography variant="body2" sx={{ color: palette.danger }}>{erro}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={gerando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={gerar} disabled={!titulo.trim() || gerando} startIcon={<AutoAwesomeRoundedIcon />}>
          {gerando ? 'Gerando...' : 'Gerar página'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
