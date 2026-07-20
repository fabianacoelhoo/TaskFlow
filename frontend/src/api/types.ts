export type StatusTarefa = 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export type Papel = 'ADMIN' | 'MEMBRO';

export type DisponibilidadeUsuario = 'DISPONIVEL' | 'PARCIAL' | 'INDISPONIVEL';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: Papel | null;
  cargo: string | null;
  cpf: string | null;
  dataNascimento: string | null;
  disponibilidade: DisponibilidadeUsuario | null;
  habilidades: string[];
}

export interface Empresa {
  id: number;
  nome: string;
  codigoConvite: string | null;
}

export type TipoResultadoPesquisa = 'PROJETO' | 'TAREFA' | 'DOCUMENTO';

export interface ResultadoPesquisa {
  tipo: TipoResultadoPesquisa;
  id: number;
  titulo: string;
  trecho: string | null;
  projetoId: number;
  projetoNome: string;
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
  historiaUsuarioId: number | null;
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

export interface ProdutividadeItem {
  usuarioId: number;
  nome: string;
  tarefasConcluidas: number;
}

export interface Dashboard {
  totalProjetos: number;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasEmAndamento: number;
  tarefasConcluidas: number;
  tarefasAtrasadas: number;
  tarefasParadas: number;
  produtividadeEquipe: ProdutividadeItem[];
  velocidadeRecente: VelocidadeItem[];
}

export interface Epico {
  id: number;
  titulo: string;
  descricao: string;
  projetoId: number;
  criadoEm: string;
}

export type StatusHistoria = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export interface HistoriaUsuario {
  id: number;
  titulo: string;
  descricao: string;
  criteriosAceitacao: string | null;
  pontos: number | null;
  prioridade: string | null;
  status: StatusHistoria;
  projetoId: number;
  epicoId: number | null;
  sprintId: number | null;
}

export type StatusSprint = 'PLANEJADA' | 'ATIVA' | 'CONCLUIDA';

export interface Sprint {
  id: number;
  nome: string;
  objetivo: string | null;
  dataInicio: string;
  dataFim: string;
  status: StatusSprint;
  projetoId: number;
  totalPontos: number;
  totalHistorias: number;
}

export interface PontoBurndown {
  data: string;
  pontos: number;
}

export interface Burndown {
  totalPontos: number;
  linhaIdeal: PontoBurndown[];
  real: PontoBurndown[];
}

export interface VelocidadeItem {
  sprintId: number;
  sprintNome: string;
  pontosConcluidos: number;
}

export interface PlanoBacklogGerado {
  epico: Epico;
  historias: HistoriaUsuario[];
  riscos: string[];
}

export interface AnaliseRisco {
  alertasGerados: number;
}

export interface SugestaoResponsavel {
  responsavelId: number;
  nomeResponsavel: string;
  justificativa: string;
}

export interface TarefaInterpretada {
  titulo: string;
  descricao: string;
  prioridade: string;
  prazo: string | null;
  responsavelId: number | null;
  nomeResponsavel: string | null;
}

export type SituacaoProgressoSprint = 'NO_RITMO' | 'ATENCAO' | 'ATRASADA';

export interface AnaliseProgressoSprint {
  situacao: SituacaoProgressoSprint;
  mensagem: string;
}

export type TipoAcaoAutomacao =
  | 'NOTIFICAR_RESPONSAVEL'
  | 'NOTIFICAR_MEMBROS_PROJETO'
  | 'MOVER_PARA_STATUS'
  | 'ADICIONAR_TAG';

export interface AcaoAutomacao {
  id: number;
  tipo: TipoAcaoAutomacao;
  mensagem: string | null;
  statusDestino: StatusTarefa | null;
  tagId: number | null;
  tagNome: string | null;
}

export interface RegraAutomacao {
  id: number;
  nome: string;
  projetoId: number;
  statusGatilho: StatusTarefa;
  ativa: boolean;
  acoes: AcaoAutomacao[];
}

export type CategoriaDocumento =
  | 'DOCUMENTACAO_TECNICA'
  | 'REQUISITOS'
  | 'ARQUITETURA'
  | 'BANCO_DE_DADOS'
  | 'REGRAS_DE_NEGOCIO'
  | 'DECISOES'
  | 'RETROSPECTIVA_SPRINT'
  | 'OUTRO';

export interface DocumentoProjeto {
  id: number;
  titulo: string;
  categoria: CategoriaDocumento;
  conteudo: string;
  projetoId: number;
  criadoPorNome: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
}

export type CodigoConquista =
  | 'PRIMEIRA_TAREFA'
  | 'DEZ_TAREFAS'
  | 'CINQUENTA_TAREFAS'
  | 'CEM_PONTOS'
  | 'QUINHENTOS_PONTOS'
  | 'MULTIPROJETOS';

export interface Conquista {
  codigo: CodigoConquista;
  nome: string;
  descricao: string;
  desbloqueada: boolean;
  desbloqueadaEm: string | null;
}

export interface PerfilGamificacao {
  pontos: number;
  tarefasConcluidas: number;
  conquistas: Conquista[];
}

export interface RankingItem {
  usuarioId: number;
  nome: string;
  pontos: number;
  tarefasConcluidas: number;
}

export interface StatusGithub {
  conectado: boolean;
  repositorioOwner: string | null;
  repositorioNome: string | null;
}

export interface BranchGithub {
  nome: string;
  url: string;
}

export interface CommitGithub {
  sha: string;
  mensagem: string;
  autor: string;
  data: string;
  url: string;
}

export interface PullRequestGithub {
  numero: number;
  titulo: string;
  estado: string;
  autor: string;
  url: string;
}

export interface AtividadeGithub {
  branches: BranchGithub[];
  commits: CommitGithub[];
  pullRequests: PullRequestGithub[];
}
