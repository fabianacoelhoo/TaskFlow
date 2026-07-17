export type StatusTarefa = 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export type Papel = 'ADMIN' | 'MEMBRO';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: Papel | null;
}

export interface Empresa {
  id: number;
  nome: string;
  codigoConvite: string | null;
}

export interface Projeto {
  id: number;
  nome: string;
  descricao: string;
  totalTarefas: number;
  tarefasConcluidas: number;
  criadoPorId: number | null;
  membros: Usuario[];
}

export interface Tag {
  id: number;
  nome: string;
  cor: string;
}

export interface TarefaResumo {
  id: number;
  titulo: string;
  status: StatusTarefa;
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
  tags: Tag[];
  dependencias: TarefaResumo[];
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

export interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
  tarefaId: number | null;
}

export interface Dashboard {
  totalProjetos: number;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasEmAndamento: number;
  tarefasConcluidas: number;
  tarefasAtrasadas: number;
}
