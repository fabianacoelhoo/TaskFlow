import { Box, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { Logo } from '../Logo';
import { palette } from '../../theme/theme';

const COLUMNS = [
  {
    title: 'Produto',
    links: ['Recursos', 'Produto', 'IA', 'Planos'],
  },
  {
    title: 'Empresa',
    links: ['Sobre', 'Contato', 'Carreiras'],
  },
  {
    title: 'Legal',
    links: ['Privacidade', 'Termos de uso'],
  },
];

export function LandingFooter() {
  return (
    <Box sx={{ bgcolor: palette.ink, color: palette.ivory, pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Logo size={30} light />
            <Typography
              variant="body2"
              sx={{ color: 'rgba(248,246,241,0.6)', mt: 2, maxWidth: 280, lineHeight: 1.7 }}
            >
              A plataforma completa de gestão de projetos para equipes que levam entrega a
              sério.
            </Typography>
          </Grid>

          {COLUMNS.map((col) => (
            <Grid key={col.title} size={{ xs: 6, sm: 4, md: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 2 }}>
                {col.title}
              </Typography>
              <Stack spacing={1.25}>
                {col.links.map((link) => (
                  <Typography
                    key={link}
                    variant="body2"
                    sx={{ color: 'rgba(248,246,241,0.6)', cursor: 'default' }}
                  >
                    {link}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 5, borderColor: 'rgba(248,246,241,0.1)' }} />

        <Typography variant="body2" sx={{ color: 'rgba(248,246,241,0.45)' }}>
          &copy; {new Date().getFullYear()} TaskFlow. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
