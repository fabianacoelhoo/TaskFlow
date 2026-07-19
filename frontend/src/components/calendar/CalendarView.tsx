import { useMemo, useState } from 'react';
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import type { Tarefa, Usuario } from '../../api/types';
import { PRIORIDADE_COLOR } from '../../theme/status';
import { palette } from '../../theme/theme';
import { buildMonthGrid, DIAS_SEMANA_LABEL, MESES_LABEL, toIsoDate } from './dateUtils';

const LIMITE_TAREFAS_POR_RESPONSAVEL = 3;
const MAX_CHIPS_VISIVEIS = 3;

interface CalendarViewProps {
  tarefas: Tarefa[];
  usuariosPorId: Map<number, Usuario>;
  onSelecionarTarefa: (tarefa: Tarefa) => void;
}

export function CalendarView({ tarefas, usuariosPorId, onSelecionarTarefa }: CalendarViewProps) {
  const hoje = useMemo(() => new Date(), []);
  const [mesAtual, setMesAtual] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  const dias = useMemo(() => buildMonthGrid(mesAtual), [mesAtual]);

  const tarefasPorDia = useMemo(() => {
    const mapa = new Map<string, Tarefa[]>();
    tarefas.forEach((t) => {
      if (!t.prazo) return;
      const lista = mapa.get(t.prazo) ?? [];
      lista.push(t);
      mapa.set(t.prazo, lista);
    });
    return mapa;
  }, [tarefas]);

  const sobrecargaPorDia = useMemo(() => {
    const mapa = new Map<string, string[]>();
    tarefasPorDia.forEach((lista, iso) => {
      const contagemPorResponsavel = new Map<number, number>();
      lista
        .filter((t) => t.status !== 'CONCLUIDO')
        .forEach((t) => {
          contagemPorResponsavel.set(t.responsavelId, (contagemPorResponsavel.get(t.responsavelId) ?? 0) + 1);
        });

      const nomesSobrecarregados: string[] = [];
      contagemPorResponsavel.forEach((count, responsavelId) => {
        if (count >= LIMITE_TAREFAS_POR_RESPONSAVEL) {
          const nome = usuariosPorId.get(responsavelId)?.nome ?? 'Alguém';
          nomesSobrecarregados.push(`${nome} (${count} tarefas)`);
        }
      });

      if (nomesSobrecarregados.length > 0) {
        mapa.set(iso, nomesSobrecarregados);
      }
    });
    return mapa;
  }, [tarefasPorDia, usuariosPorId]);

  const isoHoje = toIsoDate(hoje);

  function mesAnterior() {
    setMesAtual((atual) => new Date(atual.getFullYear(), atual.getMonth() - 1, 1));
  }

  function proximoMes() {
    setMesAtual((atual) => new Date(atual.getFullYear(), atual.getMonth() + 1, 1));
  }

  function irParaHoje() {
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontSize: '1.05rem' }}>
            {MESES_LABEL[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </Typography>
          <Button size="small" variant="text" onClick={irParaHoje} sx={{ minWidth: 0, color: palette.gold, fontWeight: 700 }}>
            Hoje
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ChevronLeftRoundedIcon />}
            onClick={mesAnterior}
          >
            Mês anterior
          </Button>
          <Button
            size="small"
            variant="outlined"
            endIcon={<ChevronRightRoundedIcon />}
            onClick={proximoMes}
          >
            Próximo mês
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          width: '100%',
          borderTop: `1px solid ${palette.line}`,
          borderLeft: `1px solid ${palette.line}`,
        }}
      >
        {DIAS_SEMANA_LABEL.map((label) => (
          <Box
            key={label}
            sx={{
              py: 1,
              textAlign: 'center',
              borderRight: `1px solid ${palette.line}`,
              borderBottom: `1px solid ${palette.line}`,
              bgcolor: 'rgba(15,28,46,0.02)',
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: palette.slate }}>
              {label}
            </Typography>
          </Box>
        ))}

        {dias.map((dia) => {
          const iso = toIsoDate(dia);
          const tarefasDoDia = tarefasPorDia.get(iso) ?? [];
          const foraDoMes = dia.getMonth() !== mesAtual.getMonth();
          const ehHoje = iso === isoHoje;
          const sobrecarga = sobrecargaPorDia.get(iso);
          const visiveis = tarefasDoDia.slice(0, MAX_CHIPS_VISIVEIS);
          const restantes = tarefasDoDia.length - visiveis.length;

          return (
            <Box
              key={iso}
              sx={{
                minHeight: 108,
                minWidth: 0,
                overflow: 'hidden',
                p: 0.75,
                borderRight: `1px solid ${palette.line}`,
                borderBottom: `1px solid ${palette.line}`,
                bgcolor: foraDoMes ? 'rgba(15,28,46,0.015)' : palette.paper,
                position: 'relative',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: ehHoje ? palette.ink : 'transparent',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: ehHoje ? 700 : 600,
                      color: ehHoje ? palette.ivory : foraDoMes ? palette.slateLight : palette.ink,
                    }}
                  >
                    {dia.getDate()}
                  </Typography>
                </Box>
                {sobrecarga && (
                  <Tooltip title={`Dia sobrecarregado: ${sobrecarga.join(', ')}`}>
                    <WarningRoundedIcon sx={{ fontSize: 15, color: palette.warning }} />
                  </Tooltip>
                )}
              </Stack>

              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                {visiveis.map((tarefa) => (
                  <Box
                    key={tarefa.id}
                    onClick={() => onSelecionarTarefa(tarefa)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      minWidth: 0,
                      px: 0.6,
                      py: 0.3,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      bgcolor: `${PRIORIDADE_COLOR[tarefa.prioridade ?? 'MEDIA']}14`,
                      '&:hover': { bgcolor: `${PRIORIDADE_COLOR[tarefa.prioridade ?? 'MEDIA']}26` },
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        flexShrink: 0,
                        bgcolor: PRIORIDADE_COLOR[tarefa.prioridade ?? 'MEDIA'],
                      }}
                    />
                    <Typography
                      noWrap
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: palette.ink,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {tarefa.titulo}
                    </Typography>
                  </Box>
                ))}
                {restantes > 0 && (
                  <Typography sx={{ fontSize: '0.65rem', color: palette.slateLight, pl: 0.6, fontWeight: 600 }}>
                    +{restantes} mais
                  </Typography>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
