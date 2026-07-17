import { Avatar, Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import type { Tarefa, Usuario } from '../api/types';
import { PRIORIDADE_COLOR, PRIORIDADE_LABEL } from '../theme/status';
import { palette } from '../theme/theme';

interface TaskCardProps {
  tarefa: Tarefa;
  responsavel?: Usuario;
  onClick: () => void;
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano.slice(2)}`;
}

function iniciais(nome?: string) {
  if (!nome) return '?';
  return nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function TaskCard({ tarefa, responsavel, onClick }: TaskCardProps) {
  const atrasada =
    tarefa.status !== 'CONCLUIDO' && tarefa.prazo != null && new Date(tarefa.prazo) < new Date(new Date().toDateString());

  const dependenciasPendentes = tarefa.dependencias.filter((d) => d.status !== 'CONCLUIDO');

  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: palette.paper,
        border: `1px solid ${palette.line}`,
        borderRadius: 3,
        p: 2,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        '&:hover': {
          boxShadow: '0 8px 20px rgba(15,28,46,0.08)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: palette.ink, fontWeight: 700 }}>
          {tarefa.titulo}
        </Typography>
        {dependenciasPendentes.length > 0 && (
          <Tooltip title={`Bloqueada por: ${dependenciasPendentes.map((d) => d.titulo).join(', ')}`}>
            <LinkRoundedIcon sx={{ fontSize: 16, color: palette.slateLight, flexShrink: 0, mt: 0.3 }} />
          </Tooltip>
        )}
      </Stack>

      {tarefa.tags.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          {tarefa.tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.nome}
              size="small"
              sx={{
                bgcolor: `${tag.cor}1A`,
                color: tag.cor,
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
              }}
            />
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        {tarefa.prioridade && (
          <Chip
            label={PRIORIDADE_LABEL[tarefa.prioridade] ?? tarefa.prioridade}
            size="small"
            sx={{
              bgcolor: `${PRIORIDADE_COLOR[tarefa.prioridade] ?? palette.slate}1A`,
              color: PRIORIDADE_COLOR[tarefa.prioridade] ?? palette.slate,
              height: 22,
              fontSize: '0.7rem',
            }}
          />
        )}
        {tarefa.prazo && (
          <Chip
            icon={<EventRoundedIcon sx={{ fontSize: '14px !important' }} />}
            label={formatarData(tarefa.prazo)}
            size="small"
            sx={{
              bgcolor: atrasada ? 'rgba(179,68,30,0.10)' : 'rgba(15,28,46,0.05)',
              color: atrasada ? palette.danger : palette.slate,
              height: 22,
              fontSize: '0.7rem',
            }}
          />
        )}
      </Stack>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
        <Avatar
          sx={{
            width: 26,
            height: 26,
            fontSize: '0.68rem',
            fontWeight: 700,
            bgcolor: palette.gold,
            color: palette.ink,
          }}
        >
          {iniciais(responsavel?.nome)}
        </Avatar>
      </Stack>
    </Box>
  );
}
