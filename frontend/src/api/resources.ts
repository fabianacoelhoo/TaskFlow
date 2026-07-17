import { api } from './client';
import type {
  AcaoAutomacao,
  AnaliseRisco,
  Anexo,
  AtividadeGithub,
  Burndown,
  CategoriaDocumento,
  Comentario,
  Dashboard,
  DisponibilidadeUsuario,
  DocumentoProjeto,
  Empresa,
  Epico,
  HistoriaUsuario,
  HistoricoItem,
  Notificacao,
  Papel,
  PerfilGamificacao,
  PlanoBacklogGerado,
  Projeto,
  RankingItem,
  RegraAutomacao,
  Sprint,
  StatusGithub,
  StatusHistoria,
  StatusTarefa,
  SugestaoResponsavel,
  Tag,
  Tarefa,
  Usuario,
  VelocidadeItem,
} from './types';

export async function login(email: string, senha: string) {
  const { data } = await api.post<{ token: string }>('/auth/login', { email, senha });
  return data;
}

export async function registrarEmpresa(nomeEmpresa: string, nome: string, email: string, senha: string) {
  const { data } = await api.post<Usuario>('/auth/registrar-empresa', { nomeEmpresa, nome, email, senha });
  return data;
}

export async function registrarComCodigo(codigoConvite: string, nome: string, email: string, senha: string) {
  const { data } = await api.post<Usuario>('/auth/registrar-com-codigo', { codigoConvite, nome, email, senha });
  return data;
}

export async function obterEmpresa() {
  const { data } = await api.get<Empresa>('/empresas/me');
  return data;
}

export async function regenerarCodigoConvite() {
  const { data } = await api.post<Empresa>('/empresas/codigo-convite/regenerar');
  return data;
}

export async function listarUsuarios() {
  const { data } = await api.get<Usuario[]>('/usuarios');
  return data;
}

export async function usuarioAtual() {
  const { data } = await api.get<Usuario>('/usuarios/me');
  return data;
}

export async function alterarPapel(usuarioId: number, papel: Papel) {
  const { data } = await api.put<Usuario>(`/usuarios/${usuarioId}/papel?papel=${papel}`);
  return data;
}

export async function atualizarMeuPerfil(
  cargo: string | null,
  disponibilidade: DisponibilidadeUsuario,
  habilidades: string[],
) {
  const { data } = await api.put<Usuario>('/usuarios/me', { cargo, disponibilidade, habilidades });
  return data;
}

export async function listarProjetos() {
  const { data } = await api.get<Projeto[]>('/projetos');
  return data;
}

export async function criarProjeto(nome: string, descricao: string) {
  const { data } = await api.post<Projeto>('/projetos', { nome, descricao });
  return data;
}

export async function atualizarProjeto(id: number, nome: string, descricao: string) {
  const { data } = await api.put<Projeto>(`/projetos/${id}`, { nome, descricao });
  return data;
}

export async function excluirProjeto(id: number) {
  await api.delete(`/projetos/${id}`);
}

export async function adicionarMembroProjeto(projetoId: number, usuarioId: number) {
  const { data } = await api.post<Projeto>(`/projetos/${projetoId}/membros`, { usuarioId });
  return data;
}

export async function removerMembroProjeto(projetoId: number, usuarioId: number) {
  const { data } = await api.delete<Projeto>(`/projetos/${projetoId}/membros/${usuarioId}`);
  return data;
}

export async function listarTarefasPorProjeto(projetoId: number) {
  const { data } = await api.get<Tarefa[]>(`/tarefas/projeto/${projetoId}`);
  return data;
}

export async function listarTodasTarefas() {
  const { data } = await api.get<Tarefa[]>('/tarefas');
  return data;
}

export interface NovaTarefa {
  titulo: string;
  descricao: string;
  status: StatusTarefa;
  prioridade: string;
  prazo: string | null;
  tagIds: number[];
  dependenciaIds: number[];
  historiaUsuarioId: number | null;
}

export async function criarTarefa(
  projetoId: number,
  responsavelId: number,
  tarefa: NovaTarefa,
) {
  const { data } = await api.post<Tarefa>(
    `/tarefas?projetoId=${projetoId}&responsavelId=${responsavelId}`,
    tarefa,
  );
  return data;
}

export async function atualizarTarefa(id: number, tarefa: NovaTarefa) {
  const { data } = await api.put<Tarefa>(`/tarefas/${id}`, tarefa);
  return data;
}

export async function trocarResponsavel(id: number, responsavelId: number) {
  const { data } = await api.put<Tarefa>(`/tarefas/${id}/responsavel?responsavelId=${responsavelId}`);
  return data;
}

export async function excluirTarefa(id: number) {
  await api.delete(`/tarefas/${id}`);
}

export async function listarComentarios(tarefaId: number) {
  const { data } = await api.get<Comentario[]>(`/tarefas/${tarefaId}/comentarios`);
  return data;
}

export async function criarComentario(tarefaId: number, texto: string) {
  const { data } = await api.post<Comentario>(`/tarefas/${tarefaId}/comentarios`, { texto });
  return data;
}

export async function listarHistorico(tarefaId: number) {
  const { data } = await api.get<HistoricoItem[]>(`/tarefas/${tarefaId}/historico`);
  return data;
}

export async function listarAnexos(tarefaId: number) {
  const { data } = await api.get<Anexo[]>(`/tarefas/${tarefaId}/anexos`);
  return data;
}

export async function enviarAnexo(tarefaId: number, arquivo: File) {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  const { data } = await api.post<Anexo>(`/tarefas/${tarefaId}/anexos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function baixarAnexo(anexoId: number, nomeArquivo: string) {
  const response = await api.get(`/anexos/${anexoId}/download`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function obterDashboard() {
  const { data } = await api.get<Dashboard>('/dashboard');
  return data;
}

export async function exportarRelatorioCsv() {
  const response = await api.get('/dashboard/exportar-csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'relatorio-taskflow.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function listarTags() {
  const { data } = await api.get<Tag[]>('/tags');
  return data;
}

export async function criarTag(nome: string, cor: string) {
  const { data } = await api.post<Tag>('/tags', { nome, cor });
  return data;
}

export async function listarNotificacoes() {
  const { data } = await api.get<Notificacao[]>('/notificacoes');
  return data;
}

export async function contarNotificacoesNaoLidas() {
  const { data } = await api.get<{ quantidade: number }>('/notificacoes/nao-lidas/contagem');
  return data.quantidade;
}

export async function marcarNotificacaoComoLida(id: number) {
  await api.put(`/notificacoes/${id}/lida`);
}

export async function marcarTodasNotificacoesComoLidas() {
  await api.put('/notificacoes/lidas');
}

export async function perguntarIA(pergunta: string) {
  const { data } = await api.post<{ resposta: string }>('/ai/perguntar', { pergunta });
  return data.resposta;
}

export async function gerarTarefasComIA(projetoId: number, descricao: string, responsavelId: number) {
  const { data } = await api.post<Tarefa[]>(`/ai/projetos/${projetoId}/gerar-tarefas`, {
    descricao,
    responsavelId,
  });
  return data;
}

export interface PrazoSugerido {
  prazo: string;
  justificativa: string;
}

export async function sugerirPrazoComIA(titulo: string, prioridade: string, responsavelId: number) {
  const { data } = await api.post<PrazoSugerido>('/ai/sugerir-prazo', {
    titulo,
    prioridade,
    responsavelId,
  });
  return data;
}

export async function listarEpicos(projetoId: number) {
  const { data } = await api.get<Epico[]>(`/projetos/${projetoId}/epicos`);
  return data;
}

export async function criarEpico(projetoId: number, titulo: string, descricao: string) {
  const { data } = await api.post<Epico>(`/projetos/${projetoId}/epicos`, { titulo, descricao });
  return data;
}

export async function atualizarEpico(id: number, titulo: string, descricao: string) {
  const { data } = await api.put<Epico>(`/epicos/${id}`, { titulo, descricao });
  return data;
}

export async function excluirEpico(id: number) {
  await api.delete(`/epicos/${id}`);
}

export interface NovaHistoria {
  titulo: string;
  descricao: string;
  criteriosAceitacao: string | null;
  pontos: number | null;
  prioridade: string;
  status?: StatusHistoria;
  epicoId: number | null;
  sprintId: number | null;
}

export async function listarHistorias(projetoId: number) {
  const { data } = await api.get<HistoriaUsuario[]>(`/projetos/${projetoId}/historias`);
  return data;
}

export async function criarHistoria(projetoId: number, historia: NovaHistoria) {
  const { data } = await api.post<HistoriaUsuario>(`/projetos/${projetoId}/historias`, historia);
  return data;
}

export async function atualizarHistoria(id: number, historia: NovaHistoria) {
  const { data } = await api.put<HistoriaUsuario>(`/historias/${id}`, historia);
  return data;
}

export async function excluirHistoria(id: number) {
  await api.delete(`/historias/${id}`);
}

export interface NovaSprint {
  nome: string;
  objetivo: string | null;
  dataInicio: string;
  dataFim: string;
}

export async function listarSprints(projetoId: number) {
  const { data } = await api.get<Sprint[]>(`/projetos/${projetoId}/sprints`);
  return data;
}

export async function criarSprint(projetoId: number, sprint: NovaSprint) {
  const { data } = await api.post<Sprint>(`/projetos/${projetoId}/sprints`, sprint);
  return data;
}

export async function atualizarSprint(id: number, sprint: NovaSprint) {
  const { data } = await api.put<Sprint>(`/sprints/${id}`, sprint);
  return data;
}

export async function excluirSprint(id: number) {
  await api.delete(`/sprints/${id}`);
}

export async function iniciarSprint(id: number) {
  const { data } = await api.put<Sprint>(`/sprints/${id}/iniciar`);
  return data;
}

export async function concluirSprint(id: number) {
  const { data } = await api.put<Sprint>(`/sprints/${id}/concluir`);
  return data;
}

export async function obterBurndown(sprintId: number) {
  const { data } = await api.get<Burndown>(`/sprints/${sprintId}/burndown`);
  return data;
}

export async function obterVelocidade(projetoId: number) {
  const { data } = await api.get<VelocidadeItem[]>(`/projetos/${projetoId}/velocidade`);
  return data;
}

export async function gerarPlanoBacklogComIA(projetoId: number, descricao: string, responsavelId: number) {
  const { data } = await api.post<PlanoBacklogGerado>(`/ai/projetos/${projetoId}/gerar-backlog`, {
    descricao,
    responsavelId,
  });
  return data;
}

export async function analisarRiscosComIA(projetoId: number) {
  const { data } = await api.post<AnaliseRisco>(`/ai/projetos/${projetoId}/analisar-riscos`);
  return data;
}

export async function sugerirResponsavelComIA(projetoId: number, titulo: string, descricao: string) {
  const { data } = await api.post<SugestaoResponsavel>(`/ai/projetos/${projetoId}/sugerir-responsavel`, {
    titulo,
    descricao,
  });
  return data;
}

export interface NovaAcaoAutomacao {
  tipo: AcaoAutomacao['tipo'];
  mensagem: string | null;
  statusDestino: StatusTarefa | null;
  tagId: number | null;
}

export interface NovaRegraAutomacao {
  nome: string;
  statusGatilho: StatusTarefa;
  ativa: boolean;
  acoes: NovaAcaoAutomacao[];
}

export async function listarAutomacoes(projetoId: number) {
  const { data } = await api.get<RegraAutomacao[]>(`/projetos/${projetoId}/automacoes`);
  return data;
}

export async function criarAutomacao(projetoId: number, regra: NovaRegraAutomacao) {
  const { data } = await api.post<RegraAutomacao>(`/projetos/${projetoId}/automacoes`, regra);
  return data;
}

export async function atualizarAutomacao(id: number, regra: NovaRegraAutomacao) {
  const { data } = await api.put<RegraAutomacao>(`/automacoes/${id}`, regra);
  return data;
}

export async function excluirAutomacao(id: number) {
  await api.delete(`/automacoes/${id}`);
}

export interface NovoDocumento {
  titulo: string;
  categoria: CategoriaDocumento;
  conteudo: string;
}

export async function listarDocumentos(projetoId: number) {
  const { data } = await api.get<DocumentoProjeto[]>(`/projetos/${projetoId}/documentos`);
  return data;
}

export async function criarDocumento(projetoId: number, documento: NovoDocumento) {
  const { data } = await api.post<DocumentoProjeto>(`/projetos/${projetoId}/documentos`, documento);
  return data;
}

export async function atualizarDocumento(id: number, documento: NovoDocumento) {
  const { data } = await api.put<DocumentoProjeto>(`/documentos/${id}`, documento);
  return data;
}

export async function excluirDocumento(id: number) {
  await api.delete(`/documentos/${id}`);
}

export async function gerarDocumentoComIA(
  projetoId: number,
  titulo: string,
  categoria: CategoriaDocumento,
  instrucoes: string,
) {
  const { data } = await api.post<DocumentoProjeto>(`/ai/projetos/${projetoId}/gerar-documento`, {
    titulo,
    categoria,
    instrucoes,
  });
  return data;
}

export async function obterPerfilGamificacao() {
  const { data } = await api.get<PerfilGamificacao>('/gamificacao/me');
  return data;
}

export async function obterRanking() {
  const { data } = await api.get<RankingItem[]>('/gamificacao/ranking');
  return data;
}

export async function statusGithub(projetoId: number) {
  const { data } = await api.get<StatusGithub>(`/projetos/${projetoId}/github`);
  return data;
}

export async function conectarGithub(
  projetoId: number,
  repositorioOwner: string,
  repositorioNome: string,
  tokenAcesso: string,
) {
  const { data } = await api.post<StatusGithub>(`/projetos/${projetoId}/github`, {
    repositorioOwner,
    repositorioNome,
    tokenAcesso,
  });
  return data;
}

export async function desconectarGithub(projetoId: number) {
  await api.delete(`/projetos/${projetoId}/github`);
}

export async function obterAtividadeGithub(tarefaId: number) {
  const { data } = await api.get<AtividadeGithub>(`/tarefas/${tarefaId}/github`);
  return data;
}
