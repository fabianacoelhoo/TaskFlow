import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { palette } from '../../theme/theme';
import { Reveal } from '../Reveal';
import { HeroMockup } from './HeroMockup';

export function LandingHero() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 16, md: 20 },
        pb: { xs: 10, md: 14 },
        bgcolor: palette.ivory,
      }}
    >
      {/* animated gradient blobs */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -180,
          right: -120,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.gold} 0%, transparent 70%)`,
          opacity: 0.18,
          filter: 'blur(10px)',
          animation: 'floatBlob 14s ease-in-out infinite',
          '@keyframes floatBlob': {
            '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
            '50%': { transform: 'translate(-30px, 40px) scale(1.08)' },
          },
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -220,
          left: -160,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.navy} 0%, transparent 70%)`,
          opacity: 0.12,
          filter: 'blur(10px)',
          animation: 'floatBlob2 16s ease-in-out infinite',
          '@keyframes floatBlob2': {
            '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
            '50%': { transform: 'translate(40px, -30px) scale(1.1)' },
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={{ xs: 8, lg: 6 }}
          alignItems="center"
        >
          <Box sx={{ flex: 1, maxWidth: 620 }}>
            <Reveal>
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                label="Gestão de projetos com Inteligência Artificial"
                sx={{
                  bgcolor: 'rgba(176,141,79,0.12)',
                  color: palette.gold,
                  fontWeight: 700,
                  mb: 3,
                  px: 0.5,
                }}
              />
            </Reveal>

            <Reveal delay={0.08}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.4rem', sm: '3rem', md: '3.6rem' },
                  lineHeight: 1.1,
                  mb: 3,
                }}
              >
                A plataforma completa para equipes que{' '}
                <Box component="span" sx={{ color: palette.gold }}>
                  entregam com excelência
                </Box>
              </Typography>
            </Reveal>

            <Reveal delay={0.16}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.15rem',
                  color: palette.slate,
                  lineHeight: 1.7,
                  mb: 4.5,
                  maxWidth: 540,
                }}
              >
                Kanban visual, papéis e permissões, dependências entre tarefas e um
                assistente de IA que responde sobre o andamento dos projetos e gera planos
                de trabalho inteiros a partir de uma ideia. Tudo em um só lugar.
              </Typography>
            </Reveal>

            <Reveal delay={0.24}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  component={RouterLink}
                  to="/login?modo=criar"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ py: 1.5, px: 3.5 }}
                >
                  Começar gratuitamente
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  color="inherit"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={() =>
                    document.querySelector('#produto')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  sx={{
                    py: 1.5,
                    px: 3.5,
                    borderColor: palette.line,
                    color: palette.ink,
                    '&:hover': { borderColor: palette.ink, bgcolor: 'transparent' },
                  }}
                >
                  Ver como funciona
                </Button>
              </Stack>
            </Reveal>

            <Reveal delay={0.32}>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                {['Sem cartão de crédito', 'Configuração em minutos', 'Suporte em português'].map(
                  (item) => (
                    <Stack key={item} direction="row" spacing={0.75} alignItems="center">
                      <CheckCircleRoundedIcon sx={{ fontSize: 17, color: palette.success }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: palette.slate }}>
                        {item}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Reveal>
          </Box>

          <Box sx={{ flex: 1, width: '100%', maxWidth: 560 }}>
            <Reveal delay={0.2} y={40}>
              <HeroMockup />
            </Reveal>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
