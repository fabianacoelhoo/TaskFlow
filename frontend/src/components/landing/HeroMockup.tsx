import { Box, Stack, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import { palette } from '../../theme/theme';

const COLUMNS = [
  {
    title: 'A Fazer',
    color: '#3B82F6',
    cards: [
      { title: 'Modelagem do banco de dados', tag: 'Alta', tagColor: palette.danger },
      { title: 'Configurar CI/CD', tag: 'Média', tagColor: palette.gold },
    ],
  },
  {
    title: 'Em Andamento',
    color: palette.gold,
    cards: [
      { title: 'Endpoint de autenticação', tag: 'Alta', tagColor: palette.danger },
    ],
  },
  {
    title: 'Concluído',
    color: palette.success,
    cards: [
      { title: 'Setup do projeto', tag: 'Feito', tagColor: palette.success },
    ],
  },
];

export function HeroMockup() {
  return (
    <Box
      sx={{
        position: 'relative',
        animation: 'heroFloat 7s ease-in-out infinite',
        '@keyframes heroFloat': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      }}
    >
      {/* main mockup card */}
      <Box
        sx={{
          bgcolor: palette.paper,
          borderRadius: 4,
          border: `1px solid ${palette.line}`,
          boxShadow: '0 30px 70px rgba(15,28,46,0.18)',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${palette.line}` }}
        >
          {['#EF7D63', '#F2C14E', '#57B37B'].map((c) => (
            <Box key={c} sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c }} />
          ))}
          <Typography variant="caption" sx={{ ml: 1.5, color: palette.slateLight, fontWeight: 600 }}>
            app.taskflow.com/projetos/lancamento-q3
          </Typography>
        </Stack>

        <Box sx={{ p: 2.25 }}>
          <Stack direction="row" spacing={1.5}>
            {COLUMNS.map((col) => (
              <Box key={col.title} sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.25, px: 0.25 }}>
                  <CircleRoundedIcon sx={{ fontSize: 7, color: col.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: palette.ink }}>
                    {col.title}
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {col.cards.map((card) => (
                    <Box
                      key={card.title}
                      sx={{
                        bgcolor: palette.ivory,
                        border: `1px solid ${palette.line}`,
                        borderRadius: 2,
                        p: 1.1,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: palette.ink, mb: 0.75 }}>
                        {card.title}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-block',
                          fontSize: '0.58rem',
                          fontWeight: 700,
                          color: card.tagColor,
                          bgcolor: `${card.tagColor}1A`,
                          borderRadius: 1,
                          px: 0.75,
                          py: 0.25,
                        }}
                      >
                        {card.tag}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* floating AI badge */}
      <Box
        sx={{
          position: 'absolute',
          top: -22,
          right: -18,
          bgcolor: palette.ink,
          color: palette.ivory,
          borderRadius: 3,
          boxShadow: '0 16px 36px rgba(15,28,46,0.3)',
          px: 1.75,
          py: 1.1,
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 0.9,
          animation: 'badgeFloat 5s ease-in-out infinite',
          animationDelay: '0.5s',
          '@keyframes badgeFloat': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        }}
      >
        <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: palette.gold }} />
        <Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.2 }}>
            IA gerou 7 tarefas
          </Typography>
          <Typography sx={{ fontSize: '0.62rem', color: 'rgba(248,246,241,0.6)' }}>
            em 4 segundos
          </Typography>
        </Box>
      </Box>

      {/* floating photo card */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -28,
          left: -28,
          width: 148,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 44px rgba(15,28,46,0.28)',
          border: `3px solid ${palette.paper}`,
          display: { xs: 'none', sm: 'block' },
          animation: 'photoFloat 8s ease-in-out infinite',
          animationDelay: '1s',
          '@keyframes photoFloat': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(12px)' },
          },
        }}
      >
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80"
          alt="Equipe colaborando"
          sx={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
        />
      </Box>
    </Box>
  );
}
