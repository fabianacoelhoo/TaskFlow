import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import { palette } from '../../theme/theme';
import { Reveal } from '../Reveal';

const FEATURES = [
  {
    icon: ViewKanbanRoundedIcon,
    title: 'Kanban visual e fluido',
    description:
      'Arraste e solte tarefas entre colunas, acompanhe o status de cada entrega e mantenha o time alinhado em tempo real.',
  },
  {
    icon: AutoAwesomeRoundedIcon,
    title: 'AI Project Manager',
    description:
      'Pergunte sobre o andamento dos projetos ou descreva uma ideia e deixe a IA gerar um plano de tarefas completo em segundos.',
  },
  {
    icon: AdminPanelSettingsRoundedIcon,
    title: 'Papéis e permissões',
    description:
      'Controle quem administra projetos e quem executa tarefas, com uma hierarquia clara pensada para times em crescimento.',
  },
  {
    icon: SellRoundedIcon,
    title: 'Tags e prioridades',
    description:
      'Organize tarefas por contexto e urgência com etiquetas coloridas e níveis de prioridade visíveis em cada cartão.',
  },
  {
    icon: AccountTreeRoundedIcon,
    title: 'Dependências entre tarefas',
    description:
      'Modele o fluxo real do trabalho: uma tarefa só é liberada quando as suas dependências forem concluídas.',
  },
  {
    icon: NotificationsActiveRoundedIcon,
    title: 'Notificações inteligentes',
    description:
      'Alertas automáticos de atribuição, comentários e prazos próximos, para que nada passe despercebido.',
  },
];

export function FeatureGrid() {
  return (
    <Box id="recursos" sx={{ py: { xs: 10, md: 14 }, bgcolor: palette.paper }}>
      <Container maxWidth="lg">
        <Reveal>
          <Stack spacing={1.5} sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{ color: palette.gold, fontWeight: 700 }}
            >
              Recursos
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
              Tudo que sua equipe precisa, em um só lugar
            </Typography>
            <Typography variant="body1" sx={{ color: palette.slate, fontSize: '1.05rem' }}>
              Construído para substituir planilhas soltas e ferramentas fragmentadas por um
              único fluxo de trabalho, do planejamento à entrega.
            </Typography>
          </Stack>
        </Reveal>

        <Grid container spacing={3}>
          {FEATURES.map((feature, i) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Reveal delay={(i % 3) * 0.08}>
                <Stack
                  spacing={2}
                  sx={{
                    p: 3.5,
                    height: '100%',
                    borderRadius: 4,
                    border: `1px solid ${palette.line}`,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 20px 44px rgba(15,28,46,0.1)',
                      borderColor: 'transparent',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(176,141,79,0.12)',
                      color: palette.gold,
                    }}
                  >
                    <feature.icon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontSize: '1.05rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
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
