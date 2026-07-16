export type StatusTarefa = 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface Projeto {
  id: number;
  nome: string;
  descricao: string;
}

export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  status: StatusTarefa;
  prioridade: string | null;
  prazo: string | null;
  projetoId: number;
  responsavelId: number;
}

export interface Comentario {
  id: number;
  texto: string;
  criadoEm: string;
  tarefaId: number;
  usuarioId: number;
  usuarioNome: string;
}

export interface Anexo {
  id: number;
  nomeArquivo: string;
  tarefaId: number;
}

export interface HistoricoItem {
  id: number;
  acao: string;
  data: string;
  tarefaId: number;
  usuarioId: number;
  usuarioNome: string;
}

export interface Dashboard {
  totalProjetos: number;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasEmAndamento: number;
  tarefasConcluidas: number;
  tarefasAtrasadas: number;
}
