import { api } from './client';
import type {
  Anexo,
  Comentario,
  Dashboard,
  HistoricoItem,
  Projeto,
  StatusTarefa,
  Tarefa,
  Usuario,
} from './types';

export async function login(email: string, senha: string) {
  const { data } = await api.post<{ token: string }>('/auth/login', { email, senha });
  return data;
}

export async function registrar(nome: string, email: string, senha: string) {
  const { data } = await api.post<Usuario>('/usuarios', { nome, email, senha });
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

export async function listarTarefasPorProjeto(projetoId: number) {
  const { data } = await api.get<Tarefa[]>(`/tarefas/projeto/${projetoId}`);
  return data;
}

export interface NovaTarefa {
  titulo: string;
  descricao: string;
  status: StatusTarefa;
  prioridade: string;
  prazo: string | null;
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
