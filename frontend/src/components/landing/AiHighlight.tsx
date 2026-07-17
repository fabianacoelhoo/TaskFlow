import { Box, Container, Stack, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { palette } from '../../theme/theme';
import { Reveal } from '../Reveal';

const CHAT = [
  { from: 'user', text: 'Precisamos de um sistema de login com recuperação de senha por email.' },
  {
    from: 'ai',
    text: '7 tarefas criadas: modelagem do banco, endpoints de autenticação, serviço de e-mail, telas de login e recuperação, e testes de integração.',
  },
];

export function AiHighlight() {
  return (
    <Box
      id="ia"
      sx={{
        py: { xs: 10, md: 14 },
        background: `linear-gradient(160deg, ${palette.ink} 0%, ${palette.navy} 100%)`,
        color: palette.ivory,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -140,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.gold} 0%, transparent 65%)`,
          opacity: 0.08,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={7} alignItems="center">
          <Box sx={{ flex: 1, maxWidth: 520 }}>
            <Reveal>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(176,141,79,0.2)',
                    color: palette.gold,
                  }}
                >
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </Box>
                <Typography
                  variant="overline"
                  sx={{ color: palette.goldLight, fontWeight: 700 }}
                >
                  AI Project Manager
                </Typography>
              </Stack>
            </Reveal>

            <Reveal delay={0.08}>
              <Typography
                variant="h2"
                sx={{ color: palette.ivory, fontSize: { xs: '1.9rem', md: '2.4rem' }, mb: 3 }}
              >
                Um assistente que entende o seu projeto de verdade
              </Typography>
            </Reveal>

            <Reveal delay={0.16}>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(248,246,241,0.7)', fontSize: '1.05rem', lineHeight: 1.75, mb: 4 }}
              >
                A IA do TaskFlow tem acesso ao estado real dos seus projetos. Pergunte quais
                tarefas estão atrasadas, quem está sobrecarregado ou peça um plano completo a
                partir de uma única frase — as tarefas são criadas direto no seu Kanban.
              </Typography>
            </Reveal>

            <Reveal delay={0.24}>
              <Stack spacing={2.25}>
                {[
                  { icon: ChatBubbleOutlineRoundedIcon, text: 'Responde perguntas sobre prazos, responsáveis e progresso' },
                  { icon: BoltRoundedIcon, text: 'Gera planos de tarefas completos a partir de uma ideia' },
                ].map((item) => (
                  <Stack key={item.text} direction="row" spacing={1.5} alignItems="flex-start">
                    <item.icon sx={{ fontSize: 20, color: palette.gold, mt: 0.25 }} />
                    <Typography sx={{ color: 'rgba(248,246,241,0.85)', fontSize: '0.95rem' }}>
                      {item.text}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Box>

          <Box sx={{ flex: 1, width: '100%', maxWidth: 460 }}>
            <Reveal delay={0.2} y={36}>
              <Box
                sx={{
                  bgcolor: 'rgba(248,246,241,0.06)',
                  border: '1px solid rgba(248,246,241,0.14)',
                  borderRadius: 4,
                  p: 3,
                  backdropFilter: 'blur(6px)',
                }}
              >
                <Stack spacing={2.5}>
                  {CHAT.map((msg, i) => (
                    <Stack key={i} direction="row" spacing={1.25} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          flexShrink: 0,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor:
                            msg.from === 'ai' ? 'rgba(176,141,79,0.25)' : 'rgba(248,246,241,0.15)',
                        }}
                      >
                        {msg.from === 'ai' ? (
                          <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: palette.gold }} />
                        ) : (
                          <PersonRoundedIcon sx={{ fontSize: 14, color: palette.ivory }} />
                        )}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.88rem',
                          lineHeight: 1.6,
                          color: msg.from === 'ai' ? 'rgba(248,246,241,0.9)' : palette.ivory,
                          pt: 0.3,
                        }}
                      >
                        {msg.text}
                      </Typography>
                    </Stack>
                  ))}

                  <Box
                    sx={{
                      mt: 1,
                      borderRadius: 3,
                      border: '1px solid rgba(248,246,241,0.16)',
                      bgcolor: 'rgba(15,28,46,0.4)',
                      px: 2,
                      py: 1.25,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.82rem', color: 'rgba(248,246,241,0.4)' }}>
                      Pergunte algo sobre seus projetos...
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Reveal>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
