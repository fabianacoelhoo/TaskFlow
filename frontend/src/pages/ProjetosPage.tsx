import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import {
  atualizarProjeto,
  criarProjeto,
  excluirProjeto,
  listarProjetos,
} from '../api/resources';
import type { Projeto } from '../api/types';
import { palette } from '../theme/theme';
import { useAuth } from '../auth/AuthContext';

export function ProjetosPage() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.papel === 'ADMIN';
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Projeto | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; projeto: Projeto } | null>(null);
  const navigate = useNavigate();

  function carregar() {
    setCarregando(true);
    listarProjetos()
      .then(setProjetos)
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  function abrirNovo() {
    setEditando(null);
    setNome('');
    setDescricao('');
    setDialogAberto(true);
  }

  function abrirEdicao(projeto: Projeto) {
    setEditando(projeto);
    setNome(projeto.nome);
    setDescricao(projeto.descricao);
    setDialogAberto(true);
    setMenuAnchor(null);
  }

  async function salvar() {
    setSalvando(true);
    try {
      if (editando) {
        await atualizarProjeto(editando.id, nome, descricao);
      } else {
        await criarProjeto(nome, descricao);
      }
      setDialogAberto(false);
      carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(projeto: Projeto) {
    setMenuAnchor(null);
    if (!window.confirm(`Excluir o projeto "${projeto.nome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    await excluirProjeto(projeto.id);
    carregar();
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Portfólio"
        title="Projetos"
        subtitle="Organize iniciativas e acompanhe o progresso de cada uma."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={abrirNovo}>
            Novo projeto
          </Button>
        }
      />

      {carregando ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={148} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      ) : projetos.length === 0 ? (
        <EstadoVazio onCriar={abrirNovo} />
      ) : (
        <Grid container spacing={2.5}>
          {projetos.map((projeto, i) => {
            const progresso =
              projeto.totalTarefas > 0
                ? Math.round((projeto.tarefasConcluidas / projeto.totalTarefas) * 100)
                : 0;

            return (
              <Grid key={projeto.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Reveal delay={(i % 6) * 0.06} y={18} sx={{ height: '100%' }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      position: 'relative',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 20px 44px rgba(15,28,46,0.1)',
                        borderColor: 'transparent',
                      },
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => setMenuAnchor({ el: e.currentTarget, projeto })}
                      sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
                    >
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                    <CardActionArea
                      onClick={() => navigate(`/projetos/${projeto.id}`)}
                      sx={{ height: '100%', alignItems: 'flex-start' }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(176,141,79,0.14)',
                            color: palette.gold,
                            mb: 2,
                          }}
                        >
                          <FolderRoundedIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle1" sx={{ mb: 0.5, pr: 3 }}>
                          {projeto.nome}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2.5,
                            minHeight: 40,
                          }}
                        >
                          {projeto.descricao || 'Sem descrição.'}
                        </Typography>

                        {projeto.totalTarefas > 0 ? (
                          <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <CheckCircleRoundedIcon
                                  sx={{ fontSize: 14, color: palette.success }}
                                />
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: palette.slate }}>
                                  {projeto.tarefasConcluidas} de {projeto.totalTarefas} tarefas
                                </Typography>
                              </Stack>
                              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: palette.ink }}>
                                {progresso}%
                              </Typography>
                            </Stack>
                            <Box
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(15,28,46,0.06)',
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  height: '100%',
                                  width: `${progresso}%`,
                                  borderRadius: 3,
                                  bgcolor: progresso === 100 ? palette.success : palette.gold,
                                  transition: 'width 0.6s ease',
                                }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: '0.78rem', color: palette.slateLight, fontWeight: 600 }}>
                            Nenhuma tarefa criada ainda
                          </Typography>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Reveal>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuAnchor && abrirEdicao(menuAnchor.projeto)}>
          <EditRoundedIcon fontSize="small" sx={{ mr: 1.5 }} /> Editar
        </MenuItem>
        {ehAdmin && (
          <MenuItem
            onClick={() => menuAnchor && excluir(menuAnchor.projeto)}
            sx={{ color: palette.danger }}
          >
            <DeleteRoundedIcon fontSize="small" sx={{ mr: 1.5 }} /> Excluir
          </MenuItem>
        )}
      </Menu>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="xs">
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
              <FolderRoundedIcon fontSize="small" />
            </Box>
            {editando ? 'Editar projeto' : 'Novo projeto'}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Nome do projeto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogAberto(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={salvar}
            disabled={!nome.trim() || salvando}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function EstadoVazio({ onCriar }: { onCriar: () => void }) {
  return (
    <Reveal>
      <Box
        sx={{
          border: `1px dashed ${palette.line}`,
          borderRadius: 4,
          py: 9,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(176,141,79,0.12)',
            color: palette.gold,
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <FolderRoundedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          Nenhum projeto por aqui ainda
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Crie o primeiro projeto para começar a organizar suas tarefas.
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onCriar}>
          Criar projeto
        </Button>
      </Box>
    </Reveal>
  );
}
