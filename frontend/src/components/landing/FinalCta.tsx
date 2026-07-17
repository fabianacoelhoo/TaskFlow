import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { palette } from '../../theme/theme';
import { Reveal } from '../Reveal';

export function FinalCta() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 12 },
        background: `linear-gradient(135deg, ${palette.ink} 0%, ${palette.navy} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 300,
          background: `radial-gradient(ellipse, ${palette.gold} 0%, transparent 70%)`,
          opacity: 0.1,
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative' }}>
        <Reveal>
          <Stack spacing={3.5} alignItems="center" sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{ color: palette.ivory, fontSize: { xs: '2rem', md: '2.6rem' } }}
            >
              Pronta para elevar a gestão dos seus projetos?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(248,246,241,0.7)', fontSize: '1.05rem', maxWidth: 480 }}
            >
              Crie sua conta gratuita e monte seu primeiro quadro Kanban com a ajuda da IA em
              menos de cinco minutos.
            </Typography>
            <Button
              component={RouterLink}
              to="/login?modo=criar"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                py: 1.6,
                px: 4,
                bgcolor: palette.gold,
                color: palette.ink,
                '&:hover': { bgcolor: palette.goldLight },
              }}
            >
              Criar minha conta gratuita
            </Button>
          </Stack>
        </Reveal>
      </Container>
    </Box>
  );
}
