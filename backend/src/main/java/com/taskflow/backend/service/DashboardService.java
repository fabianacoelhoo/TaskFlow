package com.taskflow.backend.service;

import com.taskflow.backend.dto.dashboard.DashboardResponseDTO;
import com.taskflow.backend.entity.StatusTarefa;
import com.taskflow.backend.repository.ProjetoRepository;
import com.taskflow.backend.repository.TarefaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;

    public DashboardService(ProjetoRepository projetoRepository, TarefaRepository tarefaRepository) {
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
    }

    public DashboardResponseDTO gerar() {

        DashboardResponseDTO dto = new DashboardResponseDTO();

        dto.setTotalProjetos(projetoRepository.count());
        dto.setTotalTarefas(tarefaRepository.count());
        dto.setTarefasPendentes(tarefaRepository.countByStatus(StatusTarefa.A_FAZER));
        dto.setTarefasEmAndamento(tarefaRepository.countByStatus(StatusTarefa.EM_ANDAMENTO));
        dto.setTarefasConcluidas(tarefaRepository.countByStatus(StatusTarefa.CONCLUIDO));
        dto.setTarefasAtrasadas(tarefaRepository.countByPrazoBeforeAndStatusNot(LocalDate.now(), StatusTarefa.CONCLUIDO));

        return dto;
    }
}
