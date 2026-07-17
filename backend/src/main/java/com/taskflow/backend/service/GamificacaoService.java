package com.taskflow.backend.service;

import com.taskflow.backend.dto.gamificacao.ConquistaDTO;
import com.taskflow.backend.dto.gamificacao.PerfilGamificacaoResponseDTO;
import com.taskflow.backend.dto.gamificacao.RankingItemDTO;
import com.taskflow.backend.entity.CodigoConquista;
import com.taskflow.backend.entity.ConquistaUsuario;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.ConquistaUsuarioRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class GamificacaoService {

    private final TarefaRepository tarefaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConquistaUsuarioRepository conquistaRepository;

    public GamificacaoService(TarefaRepository tarefaRepository,
                               UsuarioRepository usuarioRepository,
                               ConquistaUsuarioRepository conquistaRepository) {
        this.tarefaRepository = tarefaRepository;
        this.usuarioRepository = usuarioRepository;
        this.conquistaRepository = conquistaRepository;
    }

    public PerfilGamificacaoResponseDTO perfil(Usuario usuario) {
        List<Tarefa> concluidas = buscarConcluidas(usuario.getId());

        int pontos = calcularPontos(concluidas);
        long totalConcluidas = concluidas.size();
        long projetosDistintos = concluidas.stream().map(t -> t.getProjeto().getId()).distinct().count();

        List<ConquistaDTO> conquistas = new ArrayList<>();
        for (CodigoConquista codigo : CodigoConquista.values()) {
            boolean atendeCriterio = atendeCriterio(codigo, pontos, totalConcluidas, projetosDistintos);

            ConquistaUsuario existente = conquistaRepository.findByUsuarioIdAndCodigo(usuario.getId(), codigo)
                    .orElse(null);

            if (atendeCriterio && existente == null) {
                ConquistaUsuario nova = new ConquistaUsuario();
                nova.setUsuario(usuario);
                nova.setCodigo(codigo);
                nova.setDesbloqueadaEm(LocalDateTime.now());
                existente = conquistaRepository.save(nova);
            }

            conquistas.add(new ConquistaDTO(
                    codigo,
                    nomeConquista(codigo),
                    descricaoConquista(codigo),
                    existente != null,
                    existente != null ? existente.getDesbloqueadaEm() : null));
        }

        return new PerfilGamificacaoResponseDTO(pontos, totalConcluidas, conquistas);
    }

    public List<RankingItemDTO> ranking(Usuario autor) {
        return usuarioRepository.findByEmpresaId(autor.getEmpresa().getId()).stream()
                .map(u -> {
                    List<Tarefa> concluidas = buscarConcluidas(u.getId());
                    return new RankingItemDTO(u.getId(), u.getNome(), calcularPontos(concluidas), concluidas.size());
                })
                .sorted(Comparator.comparingInt(RankingItemDTO::pontos).reversed())
                .toList();
    }

    private List<Tarefa> buscarConcluidas(Long usuarioId) {
        return tarefaRepository.findByResponsavelId(usuarioId).stream()
                .filter(t -> t.getStatus() == StatusTarefa.CONCLUIDO)
                .toList();
    }

    private int calcularPontos(List<Tarefa> concluidas) {
        return concluidas.stream().mapToInt(this::pontosPorPrioridade).sum();
    }

    private int pontosPorPrioridade(Tarefa tarefa) {
        if ("BAIXA".equals(tarefa.getPrioridade())) {
            return 5;
        }
        if ("ALTA".equals(tarefa.getPrioridade())) {
            return 20;
        }
        return 10;
    }

    private boolean atendeCriterio(CodigoConquista codigo, int pontos, long tarefas, long projetos) {
        return switch (codigo) {
            case PRIMEIRA_TAREFA -> tarefas >= 1;
            case DEZ_TAREFAS -> tarefas >= 10;
            case CINQUENTA_TAREFAS -> tarefas >= 50;
            case CEM_PONTOS -> pontos >= 100;
            case QUINHENTOS_PONTOS -> pontos >= 500;
            case MULTIPROJETOS -> projetos >= 3;
        };
    }

    private String nomeConquista(CodigoConquista codigo) {
        return switch (codigo) {
            case PRIMEIRA_TAREFA -> "Primeiro Passo";
            case DEZ_TAREFAS -> "Produtivo(a)";
            case CINQUENTA_TAREFAS -> "Imparável";
            case CEM_PONTOS -> "Cem Pontos";
            case QUINHENTOS_PONTOS -> "Lenda do Time";
            case MULTIPROJETOS -> "Colaborador(a)";
        };
    }

    private String descricaoConquista(CodigoConquista codigo) {
        return switch (codigo) {
            case PRIMEIRA_TAREFA -> "Concluiu sua primeira tarefa.";
            case DEZ_TAREFAS -> "Concluiu 10 tarefas.";
            case CINQUENTA_TAREFAS -> "Concluiu 50 tarefas.";
            case CEM_PONTOS -> "Acumulou 100 pontos.";
            case QUINHENTOS_PONTOS -> "Acumulou 500 pontos.";
            case MULTIPROJETOS -> "Concluiu tarefas em 3 ou mais projetos diferentes.";
        };
    }
}
