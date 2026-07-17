package com.taskflow.backend.service;

import com.taskflow.backend.dto.github.AtividadeGithubResponseDTO;
import com.taskflow.backend.dto.github.BranchGithubDTO;
import com.taskflow.backend.dto.github.CommitGithubDTO;
import com.taskflow.backend.dto.github.ConectarGithubRequestDTO;
import com.taskflow.backend.dto.github.PullRequestGithubDTO;
import com.taskflow.backend.dto.github.StatusGithubResponseDTO;
import com.taskflow.backend.entity.IntegracaoGithub;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.exception.AcessoNegadoException;
import com.taskflow.backend.exception.RecursoNaoEncontradoException;
import com.taskflow.backend.exception.ValidacaoException;
import com.taskflow.backend.repository.IntegracaoGithubRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class GithubService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final IntegracaoGithubRepository integracaoRepository;
    private final TarefaRepository tarefaRepository;
    private final ProjetoService projetoService;
    private final AutenticacaoService autenticacaoService;

    public GithubService(HttpClient httpClient,
                          ObjectMapper objectMapper,
                          IntegracaoGithubRepository integracaoRepository,
                          TarefaRepository tarefaRepository,
                          ProjetoService projetoService,
                          AutenticacaoService autenticacaoService) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.integracaoRepository = integracaoRepository;
        this.tarefaRepository = tarefaRepository;
        this.projetoService = projetoService;
        this.autenticacaoService = autenticacaoService;
    }

    public StatusGithubResponseDTO conectar(Long projetoId, ConectarGithubRequestDTO dto) {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        Projeto projeto = projetoService.buscarPorId(projetoId);
        verificarPodeGerenciar(autor, projeto);

        IntegracaoGithub integracao = integracaoRepository.findByProjetoId(projetoId)
                .orElseGet(IntegracaoGithub::new);
        integracao.setProjeto(projeto);
        integracao.setRepositorioOwner(dto.getRepositorioOwner());
        integracao.setRepositorioNome(dto.getRepositorioNome());
        integracao.setTokenAcesso(dto.getTokenAcesso());
        integracao.setConectadoEm(LocalDateTime.now());
        integracaoRepository.save(integracao);

        return new StatusGithubResponseDTO(true, integracao.getRepositorioOwner(), integracao.getRepositorioNome());
    }

    public void desconectar(Long projetoId) {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        Projeto projeto = projetoService.buscarPorId(projetoId);
        verificarPodeGerenciar(autor, projeto);

        integracaoRepository.findByProjetoId(projetoId).ifPresent(integracaoRepository::delete);
    }

    public StatusGithubResponseDTO status(Long projetoId) {
        projetoService.buscarPorId(projetoId);

        return integracaoRepository.findByProjetoId(projetoId)
                .map(i -> new StatusGithubResponseDTO(true, i.getRepositorioOwner(), i.getRepositorioNome()))
                .orElse(new StatusGithubResponseDTO(false, null, null));
    }

    public AtividadeGithubResponseDTO buscarAtividade(Long tarefaId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa não encontrada"));

        Usuario autor = autenticacaoService.usuarioAutenticado();
        projetoService.verificarAcesso(autor, tarefa.getProjeto());

        IntegracaoGithub integracao = integracaoRepository.findByProjetoId(tarefa.getProjeto().getId())
                .orElseThrow(() -> new ValidacaoException("Este projeto não está conectado a um repositório do GitHub."));

        String termo = ("tarefa-" + tarefaId).toLowerCase();

        return new AtividadeGithubResponseDTO(
                buscarBranches(integracao, termo),
                buscarCommits(integracao, termo),
                buscarPullRequests(integracao, termo));
    }

    private void verificarPodeGerenciar(Usuario autor, Projeto projeto) {
        if (!projetoService.podeGerenciarMembros(autor, projeto)) {
            throw new AcessoNegadoException(
                    "Apenas o administrador da empresa ou o dono do projeto podem gerenciar a integração com o GitHub.");
        }
    }

    private List<BranchGithubDTO> buscarBranches(IntegracaoGithub integracao, String termo) {
        JsonNode lista = chamarGithub(integracao, "/branches?per_page=100");
        List<BranchGithubDTO> resultado = new ArrayList<>();

        for (JsonNode node : lista) {
            String nome = node.path("name").asText();
            if (nome.toLowerCase().contains(termo)) {
                String url = "https://github.com/" + integracao.getRepositorioOwner() + "/"
                        + integracao.getRepositorioNome() + "/tree/" + nome;
                resultado.add(new BranchGithubDTO(nome, url));
            }
        }

        return resultado;
    }

    private List<CommitGithubDTO> buscarCommits(IntegracaoGithub integracao, String termo) {
        JsonNode lista = chamarGithub(integracao, "/commits?per_page=100");
        List<CommitGithubDTO> resultado = new ArrayList<>();

        for (JsonNode node : lista) {
            String mensagem = node.path("commit").path("message").asText();
            if (mensagem.toLowerCase().contains(termo)) {
                String sha = node.path("sha").asText();
                String autorCommit = node.path("commit").path("author").path("name").asText();
                String data = node.path("commit").path("author").path("date").asText();
                String url = node.path("html_url").asText();
                resultado.add(new CommitGithubDTO(sha.substring(0, Math.min(7, sha.length())), mensagem, autorCommit, data, url));
            }
        }

        return resultado;
    }

    private List<PullRequestGithubDTO> buscarPullRequests(IntegracaoGithub integracao, String termo) {
        JsonNode lista = chamarGithub(integracao, "/pulls?state=all&per_page=100");
        List<PullRequestGithubDTO> resultado = new ArrayList<>();

        for (JsonNode node : lista) {
            String titulo = node.path("title").asText();
            if (titulo.toLowerCase().contains(termo)) {
                int numero = node.path("number").asInt();
                String estado = node.path("merged_at").isNull() ? node.path("state").asText() : "merged";
                String autorPr = node.path("user").path("login").asText();
                String url = node.path("html_url").asText();
                resultado.add(new PullRequestGithubDTO(numero, titulo, estado, autorPr, url));
            }
        }

        return resultado;
    }

    private JsonNode chamarGithub(IntegracaoGithub integracao, String caminho) {
        String url = "https://api.github.com/repos/" + integracao.getRepositorioOwner() + "/"
                + integracao.getRepositorioNome() + caminho;

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + integracao.getTokenAcesso())
                    .header("Accept", "application/vnd.github+json")
                    .header("X-GitHub-Api-Version", "2022-11-28")
                    .header("User-Agent", "TaskFlow")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                throw new ValidacaoException(
                        "Erro ao consultar o GitHub (" + response.statusCode() + "). Verifique o token e o repositório.");
            }

            return objectMapper.readTree(response.body());
        } catch (IOException e) {
            throw new ValidacaoException("Não foi possível se comunicar com o GitHub agora.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ValidacaoException("Não foi possível se comunicar com o GitHub agora.");
        }
    }
}
