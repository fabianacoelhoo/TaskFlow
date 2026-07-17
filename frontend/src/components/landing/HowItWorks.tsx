import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { palette } from '../../theme/theme';
import { Reveal } from '../Reveal';

const STEPS = [
  {
    number: '01',
    title: 'Crie o seu projeto',
    description: 'Defina nome, descrição e convide o time para colaborar em minutos.',
  },
  {
    number: '02',
    title: 'Descreva a ideia para a IA',
    description: 'Escreva uma frase sobre o que precisa ser feito e deixe o assistente montar o plano.',
  },
  {
    number: '03',
    title: 'Organize no Kanban',
    description: 'Arraste tarefas entre colunas, defina prioridades, tags e dependências.',
  },
  {
    number: '04',
    title: 'Acompanhe no dashboard',
    description: 'Visualize métricas, prazos e o que está atrasado em um único painel.',
  },
];

export function HowItWorks() {
  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: palette.ivory }}>
      <Container maxWidth="lg">
        <Reveal>
          <Stack spacing={1.5} sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 8 }}>
            <Typography variant="overline" sx={{ color: palette.gold, fontWeight: 700 }}>
              Como funciona
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
              Do planejamento à entrega, em quatro passos
            </Typography>
          </Stack>
        </Reveal>

        <Grid container spacing={4}>
          {STEPS.map((step, i) => (
            <Grid key={step.number} size={{ xs: 12, sm: 6, md: 3 }}>
              <Reveal delay={i * 0.1}>
                <Stack spacing={1.5}>
                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", serif',
                      fontWeight: 600,
                      fontSize: '2.2rem',
                      color: 'rgba(15,28,46,0.14)',
                      lineHeight: 1,
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Box sx={{ width: 32, height: 3, borderRadius: 2, bgcolor: palette.gold }} />
                  <Typography variant="subtitle1" sx={{ fontSize: '1.05rem' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Stack>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
