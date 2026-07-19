import { useEffect, useRef, useState } from 'react';
import {
  Box,
  ClickAwayListener,
  CircularProgress,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { useNavigate } from 'react-router-dom';
import { pesquisar } from '../api/resources';
import type { ResultadoPesquisa, TipoResultadoPesquisa } from '../api/types';
import { palette } from '../theme/theme';

const TIPO_LABEL: Record<TipoResultadoPesquisa, string> = {
  PROJETO: 'Projetos',
  TAREFA: 'Tarefas',
  DOCUMENTO: 'Documentos',
};

const TIPO_ICON: Record<TipoResultadoPesquisa, React.ReactNode> = {
  PROJETO: <ApartmentRoundedIcon sx={{ fontSize: 18 }} />,
  TAREFA: <AssignmentRoundedIcon sx={{ fontSize: 18 }} />,
  DOCUMENTO: <DescriptionRoundedIcon sx={{ fontSize: 18 }} />,
};

const ORDEM_TIPOS: TipoResultadoPesquisa[] = ['PROJETO', 'TAREFA', 'DOCUMENTO'];

export function GlobalSearch() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<ResultadoPesquisa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (termo.trim().length < 2) {
      setResultados([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    debounceRef.current = setTimeout(() => {
      pesquisar(termo.trim())
        .then((dados) => setResultados(dados))
        .finally(() => setCarregando(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [termo]);

  function irPara(resultado: ResultadoPesquisa) {
    setAberto(false);
    setTermo('');
    setResultados([]);
    if (resultado.tipo === 'PROJETO') {
      navigate(`/projetos/${resultado.id}`);
    } else if (resultado.tipo === 'TAREFA') {
      navigate(`/projetos/${resultado.projetoId}?tarefaId=${resultado.id}`);
    } else {
      navigate(`/projetos/${resultado.projetoId}/documentacao?documentoId=${resultado.id}`);
    }
  }

  const mostrarPainel = aberto && termo.trim().length >= 2;

  return (
    <ClickAwayListener onClickAway={() => setAberto(false)}>
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: 320 } }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar tarefas, projetos, documentos..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onFocus={() => setAberto(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: palette.slateLight }} />
              </InputAdornment>
            ),
            endAdornment: carregando ? (
              <InputAdornment position="end">
                <CircularProgress size={14} />
              </InputAdornment>
            ) : undefined,
            sx: { bgcolor: 'rgba(15,28,46,0.03)', borderRadius: 2 },
          }}
        />

        {mostrarPainel && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: '100%',
              mt: 0.5,
              left: 0,
              right: 0,
              maxHeight: 420,
              overflowY: 'auto',
              zIndex: 20,
              borderRadius: 2,
            }}
          >
            {resultados.length === 0 && !carregando && (
              <Typography variant="body2" sx={{ p: 2, color: palette.slateLight }}>
                Nenhum resultado para "{termo}".
              </Typography>
            )}

            {ORDEM_TIPOS.map((tipo) => {
              const itens = resultados.filter((r) => r.tipo === tipo);
              if (itens.length === 0) return null;

              return (
                <Box key={tipo} sx={{ py: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      px: 2,
                      py: 0.5,
                      fontWeight: 700,
                      color: palette.slateLight,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {TIPO_LABEL[tipo]}
                  </Typography>
                  {itens.map((item) => (
                    <Box
                      key={`${item.tipo}-${item.id}`}
                      onClick={() => irPara(item)}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.25,
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(15,28,46,0.04)' },
                      }}
                    >
                      <Box sx={{ color: palette.gold, mt: 0.25 }}>{TIPO_ICON[item.tipo]}</Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: palette.ink }}>
                          {item.titulo}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: palette.slateLight,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.tipo === 'PROJETO' ? item.trecho ?? 'Projeto' : `${item.projetoNome}${item.trecho ? ' — ' + item.trecho : ''}`}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
