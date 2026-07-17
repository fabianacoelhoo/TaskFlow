import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { perguntarIA } from '../api/resources';
import { palette } from '../theme/theme';

interface Troca {
  pergunta: string;
  resposta: string;
}

const SUGESTOES = [
  'Quais tarefas estão atrasadas?',
  'Como está o andamento dos projetos?',
  'Quem está com mais tarefas no momento?',
];

export function AiAssistant() {
  const [pergunta, setPergunta] = useState('');
  const [historico, setHistorico] = useState<Troca[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function perguntar(texto: string) {
    if (!texto.trim() || carregando) return;
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await perguntarIA(texto);
      setHistorico((atual) => [...atual, { pergunta: texto, resposta }]);
      setPergunta('');
    } catch (err: any) {
      setErro(err?.response?.data?.erro ?? 'Não foi possível falar com o assistente de IA agora.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${palette.ink} 0%, ${palette.navy} 100%)`,
        color: palette.ivory,
        border: 'none',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
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
          <Box>
            <Typography variant="subtitle1" sx={{ color: palette.ivory }}>
              AI Project Manager
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(248,246,241,0.65)' }}>
              Pergunte sobre o andamento dos seus projetos
            </Typography>
          </Box>
        </Stack>

        {historico.length > 0 && (
          <Stack spacing={2} sx={{ mb: 2.5, maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
            {historico.map((troca, i) => (
              <Stack key={i} spacing={1}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'rgba(248,246,241,0.15)' }}>
                    <PersonRoundedIcon sx={{ fontSize: 14, color: palette.ivory }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: palette.ivory, pt: 0.3 }}>
                    {troca.pergunta}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'rgba(176,141,79,0.25)' }}>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: palette.gold }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: 'rgba(248,246,241,0.85)', pt: 0.3, whiteSpace: 'pre-wrap' }}>
                    {troca.resposta}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}

        {historico.length === 0 && !carregando && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
            {SUGESTOES.map((sugestao) => (
              <Box
                key={sugestao}
                component="button"
                type="button"
                onClick={() => perguntar(sugestao)}
                sx={{
                  border: '1px solid rgba(248,246,241,0.2)',
                  bgcolor: 'rgba(248,246,241,0.06)',
                  color: palette.ivory,
                  borderRadius: 5,
                  px: 1.75,
                  py: 0.75,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  '&:hover': { bgcolor: 'rgba(248,246,241,0.12)' },
                }}
              >
                {sugestao}
              </Box>
            ))}
          </Stack>
        )}

        {carregando && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
            <CircularProgress size={16} sx={{ color: palette.gold }} />
            <Typography variant="body2" sx={{ color: 'rgba(248,246,241,0.65)' }}>
              Analisando os dados...
            </Typography>
          </Stack>
        )}

        {erro && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setErro(null)}>
            {erro}
          </Alert>
        )}

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            placeholder="Pergunte algo sobre seus projetos..."
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                perguntar(pergunta);
              }
            }}
            disabled={carregando}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(248,246,241,0.08)',
                color: palette.ivory,
                '& fieldset': { borderColor: 'rgba(248,246,241,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(248,246,241,0.35)' },
              },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(248,246,241,0.5)', opacity: 1 },
            }}
          />
          <IconButton
            onClick={() => perguntar(pergunta)}
            disabled={!pergunta.trim() || carregando}
            sx={{
              bgcolor: palette.gold,
              color: palette.ink,
              '&:hover': { bgcolor: palette.goldLight },
              '&.Mui-disabled': { bgcolor: 'rgba(248,246,241,0.1)', color: 'rgba(248,246,241,0.3)' },
            }}
          >
            <SendRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
