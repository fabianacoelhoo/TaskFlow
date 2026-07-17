import { Box, Container, Grid, Typography } from '@mui/material';
import { palette } from '../../theme/theme';
import { Reveal } from '../Reveal';
import { StatCounter } from './StatCounter';

export function ImageBanner() {
  return (
    <Box sx={{ position: 'relative', minHeight: 520, overflow: 'hidden' }}>
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1800&q=80"
        alt="Equipe trabalhando em um escritório moderno"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(105deg, ${palette.ink} 0%, rgba(15,28,46,0.88) 40%, rgba(15,28,46,0.55) 100%)`,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 10, md: 14 } }}>
        <Reveal>
          <Typography
            variant="overline"
            sx={{ color: palette.goldLight, fontWeight: 700 }}
          >
            Feita para equipes que não podem errar prazos
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: palette.ivory,
              fontSize: { xs: '1.9rem', md: '2.6rem' },
              maxWidth: 560,
              mt: 1.5,
              mb: 7,
            }}
          >
            Organização de nível corporativo, com a simplicidade que o seu time merece
          </Typography>
        </Reveal>

        <Grid container spacing={5}>
          {[
            { value: 40, suffix: '%', label: 'menos tempo em reuniões de status' },
            { value: 7, suffix: 's', prefix: '~', label: 'para a IA gerar um plano de tarefas' },
            { value: 100, suffix: '%', label: 'de visibilidade sobre prazos e responsáveis' },
          ].map((stat, i) => (
            <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
              <Reveal delay={i * 0.12}>
                <StatCounter {...stat} light />
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
