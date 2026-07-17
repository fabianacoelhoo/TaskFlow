import { useEffect, useState } from 'react';
import { Box, Button, Container, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Logo } from '../Logo';
import { palette } from '../../theme/theme';
import { useAuth } from '../../auth/AuthContext';

const LINKS = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Produto', href: '#produto' },
  { label: 'IA', href: '#ia' },
  { label: 'Planos', href: '#planos' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(href: string) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        bgcolor: scrolled ? 'rgba(248,246,241,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? `1px solid ${palette.line}` : '1px solid transparent',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 2 }}
        >
          <Box component={RouterLink} to="/" sx={{ display: 'flex', textDecoration: 'none' }}>
            <Logo size={32} />
          </Box>

          <Stack
            direction="row"
            spacing={4}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {LINKS.map((link) => (
              <Box
                key={link.href}
                component="button"
                type="button"
                onClick={() => scrollTo(link.href)}
                sx={{
                  background: 'none',
                  border: 'none',
                  p: 0,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: palette.slate,
                  '&:hover': { color: palette.ink },
                }}
              >
                {link.label}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {isAuthenticated ? (
              <Button component={RouterLink} to="/dashboard" variant="contained">
                Ir para o Dashboard
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Entrar
                </Button>
                <Button component={RouterLink} to="/login?modo=criar" variant="contained">
                  Começar agora
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
