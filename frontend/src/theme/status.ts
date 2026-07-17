import type { DisponibilidadeUsuario, StatusTarefa } from '../api/types';

export const STATUS_LABEL: Record<StatusTarefa, string> = {
  A_FAZER: 'A Fazer',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
};

// Mesmo trio validado (contraste + separação para daltonismo) usado no
// gráfico do dashboard — reaproveitado aqui para a linguagem visual do Kanban.
export const STATUS_COLOR: Record<StatusTarefa, string> = {
  A_FAZER: '#2a78d6',
  EM_ANDAMENTO: '#eda100',
  CONCLUIDO: '#008300',
};

export const STATUS_ORDER: StatusTarefa[] = ['A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDO'];

export const PRIORIDADE_COLOR: Record<string, string> = {
  ALTA: '#B3441E',
  MEDIA: '#B08D4F',
  BAIXA: '#5B6472',
};

export const PRIORIDADE_LABEL: Record<string, string> = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
};

export const DISPONIBILIDADE_LABEL: Record<DisponibilidadeUsuario, string> = {
  DISPONIVEL: 'Disponível',
  PARCIAL: 'Parcialmente disponível',
  INDISPONIVEL: 'Indisponível',
};

export const DISPONIBILIDADE_COLOR: Record<DisponibilidadeUsuario, string> = {
  DISPONIVEL: '#008300',
  PARCIAL: '#B08D4F',
  INDISPONIVEL: '#B3441E',
};
