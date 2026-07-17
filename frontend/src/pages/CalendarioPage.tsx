import { useEffect, useMemo, useState } from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { CalendarView } from '../components/calendar/CalendarView';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import { listarTodasTarefas, listarUsuarios } from '../api/resources';
import type { Tarefa, Usuario } from '../api/types';
import { PRIORIDADE_COLOR } from '../theme/status';

export function CalendarioPage() {
  const navigate = useNavigate();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);

  function carregar() {
    Promise.all([listarTodasTarefas(), listarUsuarios()]).then(([tarefasCarregadas, usuariosCarregados]) => {
      setTarefas(tarefasCarregadas);
      setUsuarios(usuariosCarregados);
      setCarregando(false);
    });
  }

  useEffect(carregar, []);

  const usuariosPorId = useMemo(() => {
    const mapa = new Map<number, Usuario>();
    usuarios.forEach((u) => mapa.set(u.id, u));
    return mapa;
  }, [usuarios]);

  return (
    <Box>
      <PageHeader
        eyebrow="Planejamento"
        title="Calendário"
        subtitle="Todas as tarefas com prazo definido, organizadas por dia."
      />

      {carregando ? (
        <Skeleton variant="rounded" height={520} sx={{ borderRadius: 4 }} />
      ) : (
        <>
          <Stack direction="row" spacing={2.5} sx={{ mb: 2.5 }}>
            {(['ALTA', 'MEDIA', 'BAIXA'] as const).map((p) => (
              <Stack key={p} direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PRIORIDADE_COLOR[p] }} />
                <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                  Prioridade {p === 'ALTA' ? 'alta' : p === 'MEDIA' ? 'média' : 'baixa'}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <CalendarView
            tarefas={tarefas}
            usuariosPorId={usuariosPorId}
            onSelecionarTarefa={setTarefaSelecionada}
          />
        </>
      )}

      <TaskDetailDrawer
        tarefa={tarefaSelecionada}
        responsavel={tarefaSelecionada ? usuariosPorId.get(tarefaSelecionada.responsavelId) : undefined}
        onClose={() => setTarefaSelecionada(null)}
        onEditar={() => tarefaSelecionada && navigate(`/projetos/${tarefaSelecionada.projetoId}`)}
        onExcluida={() => {
          setTarefaSelecionada(null);
          carregar();
        }}
      />
    </Box>
  );
}
