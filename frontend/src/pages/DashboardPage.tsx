import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { obterDashboard } from '../api/resources';
import type { Dashboard } from '../api/types';
import { palette } from '../theme/theme';
import { STATUS_COLOR } from '../theme/status';
import { useAuth } from '../auth/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  'A fazer': STATUS_COLOR.A_FAZER,
  'Em andamento': STATUS_COLOR.EM_ANDAMENTO,
  'Concluído': STATUS_COLOR.CONCLUIDO,
};

export function DashboardPage() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState<Dashboard | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    obterDashboard()
      .then(setDados)
      .finally(() => setCarregando(false));
  }, []);

  const dadosGrafico = dados
    ? [
        { status: 'A fazer', quantidade: dados.tarefasPendentes },
        { status: 'Em andamento', quantidade: dados.tarefasEmAndamento },
        { status: 'Concluído', quantidade: dados.tarefasConcluidas },
      ]
    : [];

  const primeiroNome = usuario?.nome?.split(' ')[0];

  return (
    <Box>
      <PageHeader
        eyebrow="Visão geral"
        title={primeiroNome ? `Olá, ${primeiroNome}` : 'Dashboard'}
        subtitle="Acompanhe o ritmo dos seus projetos e tarefas em um relance."
      />

      {carregando || !dados ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rounded" height={112} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Total de projetos" value={dados.totalProjetos} icon={FolderCopyRoundedIcon} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Total de tarefas" value={dados.totalTarefas} icon={AssignmentRoundedIcon} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Tarefas concluídas"
                value={dados.tarefasConcluidas}
                icon={TaskAltRoundedIcon}
                tone="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Tarefas atrasadas"
                value={dados.tarefasAtrasadas}
                icon={ReportProblemRoundedIcon}
                tone={dados.tarefasAtrasadas > 0 ? 'danger' : 'default'}
              />
            </Grid>
          </Grid>

          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Tarefas por status</Typography>
                <Typography variant="body2">
                  Distribuição de todas as tarefas cadastradas, por etapa do quadro Kanban.
                </Typography>
              </Stack>

              {dados.totalTarefas === 0 ? (
                <Typography variant="body2" sx={{ py: 4, textAlign: 'center' }}>
                  Nenhuma tarefa cadastrada ainda.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    layout="vertical"
                    data={dadosGrafico}
                    margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke={palette.line}
                      strokeDasharray="0"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: palette.slate, fontSize: 12 }}
                      axisLine={{ stroke: palette.line }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="status"
                      tick={{ fill: palette.ink, fontSize: 13, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(15,28,46,0.04)' }}
                      contentStyle={{
                        borderRadius: 10,
                        border: `1px solid ${palette.line}`,
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="quantidade" barSize={22} radius={[0, 4, 4, 0]}>
                      {dadosGrafico.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                      ))}
                      <LabelList
                        dataKey="quantidade"
                        position="right"
                        style={{ fill: palette.ink, fontWeight: 700, fontSize: 13 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
