import { Box, Container, Stack, Typography } from '@mui/material';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { palette } from '../../theme/theme';
import { Reveal } from '../Reveal';

const BARS = [
  { label: 'A fazer', value: 72, color: '#3B82F6' },
  { label: 'Em andamento', value: 46, color: palette.gold },
  { label: 'Concluído', value: 88, color: palette.success },
];

export function ProductShowcase() {
  return (
    <Box id="produto" sx={{ py: { xs: 10, md: 14 }, bgcolor: palette.paper, overflow: 'hidden' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={7} alignItems="center">
          <Box sx={{ flex: 1, width: '100%', maxWidth: 520 }}>
            <Reveal delay={0.1} y={36}>
              <Box
                sx={{
                  bgcolor: palette.ivory,
                  border: `1px solid ${palette.line}`,
                  borderRadius: 4,
                  boxShadow: '0 30px 70px rgba(15,28,46,0.12)',
                  p: 3.5,
                  position: 'relative',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                  Tarefas por status
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Projeto: Lançamento Q3
                </Typography>

                <Stack spacing={2}>
                  {BARS.map((bar) => (
                    <Box key={bar.label}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: palette.ink }}>
                          {bar.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: palette.ink }}>
                          {bar.value}%
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: 'rgba(15,28,46,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${bar.value}%`,
                            borderRadius: 5,
                            bgcolor: bar.color,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>

                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80"
                  alt="Mesa de trabalho organizada"
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    right: -30,
                    width: 128,
                    height: 96,
                    objectFit: 'cover',
                    borderRadius: 3,
                    border: `3px solid ${palette.paper}`,
                    boxShadow: '0 18px 40px rgba(15,28,46,0.22)',
                    display: { xs: 'none', sm: 'block' },
                  }}
                />
              </Box>
            </Reveal>
          </Box>

          <Box sx={{ flex: 1, maxWidth: 520 }}>
            <Reveal>
              <Typography variant="overline" sx={{ color: palette.gold, fontWeight: 700 }}>
                Produto
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' }, mt: 1, mb: 3 }}
              >
                Visibilidade completa sobre o progresso do time
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: palette.slate, fontSize: '1.05rem', lineHeight: 1.75, mb: 4 }}
              >
                Um dashboard que mostra exatamente onde cada projeto está, quem está
                sobrecarregado e o que precisa de atenção agora — sem precisar pedir
                atualizações no chat.
              </Typography>
            </Reveal>

            <Stack spacing={2.5}>
              {[
                { icon: InsightsRoundedIcon, text: 'Métricas em tempo real de tarefas por status e prioridade' },
                { icon: ScheduleRoundedIcon, text: 'Alertas automáticos de tarefas atrasadas' },
                { icon: GroupsRoundedIcon, text: 'Carga de trabalho visível por responsável' },
              ].map((item, i) => (
                <Reveal key={item.text} delay={0.1 + i * 0.08}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(176,141,79,0.12)',
                        color: palette.gold,
                      }}
                    >
                      <item.icon sx={{ fontSize: 19 }} />
                    </Box>
                    <Typography sx={{ pt: 0.5, color: palette.slate, fontSize: '0.95rem' }}>
                      {item.text}
                    </Typography>
                  </Stack>
                </Reveal>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
