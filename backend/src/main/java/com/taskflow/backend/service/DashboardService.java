package com.taskflow.backend.service;

import com.taskflow.backend.dto.dashboard.DashboardResponseDTO;
import com.taskflow.backend.dto.dashboard.ProdutividadeItemDTO;
import com.taskflow.backend.entity.Historico;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.HistoricoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final int LIMIAR_DIAS_PARADA = 5;

    private final ProjetoService projetoService;
    private final SprintService sprintService;
    private final TarefaRepository tarefaRepository;
    private final HistoricoRepository historicoRepository;
    private final AutenticacaoService autenticacaoService;

    public DashboardService(ProjetoService projetoService,
                             SprintService sprintService,
                             TarefaRepository tarefaRepository,
                             HistoricoRepository historicoRepository,
                             AutenticacaoService autenticacaoService) {
        this.projetoService = projetoService;
        this.sprintService = sprintService;
        this.tarefaRepository = tarefaRepository;
        this.historicoRepository = historicoRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public DashboardResponseDTO gerar() {

        Usuario autor = autenticacaoService.usuarioAutenticado();
        List<Projeto> projetos = projetoService.listarProjetosAcessiveis(autor);
        List<Long> projetoIds = projetos.stream().map(Projeto::getId).toList();
        List<Tarefa> tarefas = tarefaRepository.findByProjetoIdIn(projetoIds);
        LocalDate hoje = LocalDate.now();
        LocalDateTime agora = LocalDateTime.now();

        DashboardResponseDTO dto = new DashboardResponseDTO();
        dto.setTotalProjetos(projetos.size());
        dto.setTotalTarefas(tarefas.size());
        dto.setTarefasPendentes(tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.A_FAZER).count());
        dto.setTarefasEmAndamento(tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.EM_ANDAMENTO).count());
        dto.setTarefasConcluidas(tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.CONCLUIDO).count());
        dto.setTarefasAtrasadas(tarefas.stream()
                .filter(t -> t.getStatus() != StatusTarefa.CONCLUIDO && t.getPrazo() != null && t.getPrazo().isBefore(hoje))
                .count());
        dto.setTarefasParadas(tarefas.stream()
                .filter(t -> t.getStatus() != StatusTarefa.CONCLUIDO)
                .filter(t -> diasParada(t, agora) >= LIMIAR_DIAS_PARADA)
                .count());
        dto.setProdutividadeEquipe(calcularProdutividade(tarefas));
        dto.setVelocidadeRecente(sprintService.velocidadeGeral(autor));

        return dto;
    }

    public String gerarCsv() {
        Usuario autor = autenticacaoService.usuarioAutenticado();
        List<Long> projetoIds = projetoService.listarProjetosAcessiveis(autor).stream()
                .map(Projeto::getId)
                .toList();
        List<Tarefa> tarefas = tarefaRepository.findByProjetoIdIn(projetoIds);
        LocalDate hoje = LocalDate.now();

        StringBuilder csv = new StringBuilder();
        csv.append("Projeto,Tarefa,Status,Prioridade,Responsável,Prazo,Atrasada\n");

        for (Tarefa t : tarefas) {
            boolean atrasada = t.getStatus() != StatusTarefa.CONCLUIDO && t.getPrazo() != null && t.getPrazo().isBefore(hoje);

            csv.append(campoCsv(t.getProjeto().getNome())).append(',')
                    .append(campoCsv(t.getTitulo())).append(',')
                    .append(campoCsv(String.valueOf(t.getStatus()))).append(',')
                    .append(campoCsv(t.getPrioridade())).append(',')
                    .append(campoCsv(t.getResponsavel() != null ? t.getResponsavel().getNome() : "")).append(',')
                    .append(campoCsv(t.getPrazo() != null ? t.getPrazo().toString() : "")).append(',')
                    .append(atrasada ? "sim" : "não")
                    .append('\n');
        }

        return csv.toString();
    }

    private String campoCsv(String valor) {
        if (valor == null) {
            return "";
        }
        if (valor.contains(",") || valor.contains("\"") || valor.contains("\n")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }

    private List<ProdutividadeItemDTO> calcularProdutividade(List<Tarefa> tarefas) {
        return tarefas.stream()
                .filter(t -> t.getStatus() == StatusTarefa.CONCLUIDO && t.getResponsavel() != null)
                .collect(Collectors.groupingBy(Tarefa::getResponsavel, Collectors.counting()))
                .entrySet().stream()
                .map(e -> new ProdutividadeItemDTO(e.getKey().getId(), e.getKey().getNome(), e.getValue()))
                .sorted(Comparator.comparingLong(ProdutividadeItemDTO::tarefasConcluidas).reversed())
                .toList();
    }

    private long diasParada(Tarefa tarefa, LocalDateTime agora) {
        List<Historico> historico = historicoRepository.findByTarefaIdOrderByDataAsc(tarefa.getId());
        if (historico.isEmpty()) {
            return 0;
        }
        LocalDateTime ultima = historico.get(historico.size() - 1).getData();
        return ChronoUnit.DAYS.between(ultima, agora);
    }
}
