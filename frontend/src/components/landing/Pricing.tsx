import { Box, Button, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { palette } from '../../theme/theme';
import { Reveal } from '../Reveal';

const PLANS = [
  {
    name: 'Starter',
    price: 'Grátis',
    period: '',
    description: 'Para times pequenos organizarem seus primeiros projetos.',
    features: ['Até 3 projetos', 'Kanban ilimitado', 'Tags e prioridades', 'Suporte por e-mail'],
    highlighted: false,
    cta: 'Começar grátis',
  },
  {
    name: 'Professional',
    price: 'R$ 49',
    period: '/usuário/mês',
    description: 'Para equipes que precisam de IA, permissões e automações.',
    features: [
      'Projetos ilimitados',
      'AI Project Manager',
      'Papéis e permissões',
      'Dependências entre tarefas',
      'Notificações inteligentes',
    ],
    highlighted: true,
    cta: 'Começar agora',
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para organizações com necessidades de segurança e escala.',
    features: [
      'SSO e políticas de segurança',
      'Suporte dedicado 24/7',
      'Contrato de SLA',
      'Onboarding assistido',
    ],
    highlighted: false,
    cta: 'Falar com vendas',
  },
];

export function Pricing() {
  return (
    <Box id="planos" sx={{ py: { xs: 10, md: 14 }, bgcolor: palette.paper }}>
      <Container maxWidth="lg">
        <Reveal>
          <Stack spacing={1.5} sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 8 }}>
            <Typography variant="overline" sx={{ color: palette.gold, fontWeight: 700 }}>
              Planos
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
              Um plano para cada estágio da sua equipe
            </Typography>
          </Stack>
        </Reveal>

        <Grid container spacing={3} alignItems="stretch">
          {PLANS.map((plan, i) => (
            <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
              <Reveal delay={i * 0.1} sx={{ height: '100%' }}>
                <Stack
                  spacing={3}
                  sx={{
                    height: '100%',
                    p: 4,
                    borderRadius: 4,
                    position: 'relative',
                    bgcolor: plan.highlighted ? palette.ink : palette.paper,
                    border: `1px solid ${plan.highlighted ? palette.ink : palette.line}`,
                    boxShadow: plan.highlighted ? '0 24px 56px rgba(15,28,46,0.22)' : 'none',
                    transform: plan.highlighted ? { md: 'scale(1.04)' } : 'none',
                  }}
                >
                  {plan.highlighted && (
                    <Chip
                      label="Mais popular"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: palette.gold,
                        color: palette.ink,
                        fontWeight: 700,
                      }}
                    />
                  )}

                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: plan.highlighted ? palette.ivory : palette.ink, fontSize: '1.05rem' }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: plan.highlighted ? 'rgba(248,246,241,0.65)' : palette.slate, mt: 0.5 }}
                    >
                      {plan.description}
                    </Typography>
                  </Box>

                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography
                      sx={{
                        fontFamily: '"Fraunces", serif',
                        fontWeight: 600,
                        fontSize: '2.2rem',
                        color: plan.highlighted ? palette.ivory : palette.ink,
                      }}
                    >
                      {plan.price}
                    </Typography>
                    {plan.period && (
                      <Typography
                        variant="body2"
                        sx={{ color: plan.highlighted ? 'rgba(248,246,241,0.55)' : palette.slateLight }}
                      >
                        {plan.period}
                      </Typography>
                    )}
                  </Stack>

                  <Stack spacing={1.5} sx={{ flex: 1 }}>
                    {plan.features.map((feature) => (
                      <Stack key={feature} direction="row" spacing={1.1} alignItems="flex-start">
                        <CheckRoundedIcon
                          sx={{
                            fontSize: 18,
                            mt: 0.2,
                            color: plan.highlighted ? palette.gold : palette.success,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: plan.highlighted ? 'rgba(248,246,241,0.85)' : undefined }}
                        >
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    component={RouterLink}
                    to="/login?modo=criar"
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    size="large"
                    fullWidth
                    sx={
                      plan.highlighted
                        ? { bgcolor: palette.gold, color: palette.ink, '&:hover': { bgcolor: palette.goldLight } }
                        : { borderColor: palette.line, color: palette.ink }
                    }
                  >
                    {plan.cta}
                  </Button>
                </Stack>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
