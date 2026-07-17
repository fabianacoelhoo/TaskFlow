package com.taskflow.backend.service;

import com.taskflow.backend.dto.dashboard.DashboardResponseDTO;
import com.taskflow.backend.entity.Projeto;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.entity.Tarefa;
import com.taskflow.backend.entity.Usuario;
import com.taskflow.backend.repository.TarefaRepository;
import com.taskflow.backend.security.AutenticacaoService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final ProjetoService projetoService;
    private final TarefaRepository tarefaRepository;
    private final AutenticacaoService autenticacaoService;

    public DashboardService(ProjetoService projetoService,
                             TarefaRepository tarefaRepository,
                             AutenticacaoService autenticacaoService) {
        this.projetoService = projetoService;
        this.tarefaRepository = tarefaRepository;
        this.autenticacaoService = autenticacaoService;
    }

    public DashboardResponseDTO gerar() {

        Usuario autor = autenticacaoService.usuarioAutenticado();
        List<Projeto> projetos = projetoService.listarProjetosAcessiveis(autor);
        List<Long> projetoIds = projetos.stream().map(Projeto::getId).toList();
        List<Tarefa> tarefas = tarefaRepository.findByProjetoIdIn(projetoIds);
        LocalDate hoje = LocalDate.now();

        DashboardResponseDTO dto = new DashboardResponseDTO();
        dto.setTotalProjetos(projetos.size());
        dto.setTotalTarefas(tarefas.size());
        dto.setTarefasPendentes(tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.A_FAZER).count());
        dto.setTarefasEmAndamento(tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.EM_ANDAMENTO).count());
        dto.setTarefasConcluidas(tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.CONCLUIDO).count());
        dto.setTarefasAtrasadas(tarefas.stream()
                .filter(t -> t.getStatus() != StatusTarefa.CONCLUIDO && t.getPrazo() != null && t.getPrazo().isBefore(hoje))
                .count());

        return dto;
    }
}
