import { useEffect, useState } from 'react';
import { Avatar, Box, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../auth/AuthContext';
import { obterPerfilGamificacao, obterRanking } from '../api/resources';
import type { PerfilGamificacao, RankingItem } from '../api/types';
import { palette } from '../theme/theme';

function iniciaisDe(nome?: string) {
  return (nome ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function GamificacaoPage() {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState<PerfilGamificacao | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([obterPerfilGamificacao(), obterRanking()]).then(([perfilCarregado, rankingCarregado]) => {
      setPerfil(perfilCarregado);
      setRanking(rankingCarregado);
      setCarregando(false);
    });
  }, []);

  return (
    <Box>
      <PageHeader
        eyebrow="Engajamento"
        title="Conquistas"
        subtitle="Pontos, conquistas e o ranking da sua equipe."
      />

      {carregando || !perfil ? (
        <Stack spacing={2.5}>
          <Grid container spacing={2.5}>
            {Array.from({ length: 2 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={112} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 4 }} />
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard label="Seus pontos" value={perfil.pontos} icon={StarsRoundedIcon} tone="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard label="Tarefas concluídas" value={perfil.tarefasConcluidas} icon={TaskAltRoundedIcon} />
            </Grid>
          </Grid>

          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Suas conquistas
              </Typography>
              <Grid container spacing={2}>
                {perfil.conquistas.map((c, i) => (
                  <Grid key={c.codigo} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Reveal delay={(i % 6) * 0.05}>
                      <Stack
                        spacing={1}
                        alignItems="center"
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: `1px solid ${palette.line}`,
                          textAlign: 'center',
                          opacity: c.desbloqueada ? 1 : 0.45,
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: c.desbloqueada ? 'rgba(176,141,79,0.16)' : 'rgba(15,28,46,0.06)',
                            color: c.desbloqueada ? palette.gold : palette.slateLight,
                          }}
                        >
                          <EmojiEventsRoundedIcon />
                        </Box>
                        <Typography variant="subtitle2">{c.nome}</Typography>
                        <Typography variant="caption" sx={{ color: palette.slateLight }}>
                          {c.descricao}
                        </Typography>
                        {c.desbloqueada && c.desbloqueadaEm && (
                          <Chip
                            label={new Date(c.desbloqueadaEm).toLocaleDateString('pt-BR')}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                      </Stack>
                    </Reveal>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Ranking da equipe
              </Typography>
              <Stack spacing={0.5}>
                {ranking.map((item, index) => {
                  const souEu = item.usuarioId === usuario?.id;
                  return (
                    <Stack
                      key={item.usuarioId}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: souEu ? 'rgba(176,141,79,0.08)' : 'transparent',
                      }}
                    >
                      <Typography sx={{ width: 24, fontWeight: 700, color: palette.slateLight, textAlign: 'center' }}>
                        {index + 1}
                      </Typography>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: palette.ink, color: palette.ivory }}>
                        {iniciaisDe(item.nome)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: souEu ? 700 : 600 }} noWrap>
                          {item.nome} {souEu && '(você)'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: palette.slateLight }}>
                          {item.tarefasConcluidas} tarefa(s) concluída(s)
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: palette.gold }}>{item.pontos} pts</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
