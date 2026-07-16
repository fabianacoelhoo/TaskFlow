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
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import {
  atualizarProjeto,
  criarProjeto,
  excluirProjeto,
  listarProjetos,
} from '../api/resources';
import type { Projeto } from '../api/types';
import { palette } from '../theme/theme';

export function ProjetosPage() {
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
          {projetos.map((projeto) => (
            <Grid key={projeto.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={0} sx={{ height: '100%', position: 'relative' }}>
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
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {projeto.descricao || 'Sem descrição.'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
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
        <MenuItem
          onClick={() => menuAnchor && excluir(menuAnchor.projeto)}
          sx={{ color: palette.danger }}
        >
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1.5 }} /> Excluir
        </MenuItem>
      </Menu>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editando ? 'Editar projeto' : 'Novo projeto'}</DialogTitle>
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
    <Box
      sx={{
        border: `1px dashed ${palette.line}`,
        borderRadius: 4,
        py: 8,
        textAlign: 'center',
      }}
    >
      <FolderRoundedIcon sx={{ fontSize: 40, color: palette.gold, mb: 1.5 }} />
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
  );
}
