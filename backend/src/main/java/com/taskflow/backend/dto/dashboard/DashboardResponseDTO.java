package com.taskflow.backend.dto.dashboard;

import com.taskflow.backend.dto.sprint.VelocidadeItemDTO;
import lombok.Data;

import java.util.List;

@Data
public class DashboardResponseDTO {

    private long totalProjetos;
    private long totalTarefas;
    private long tarefasPendentes;
    private long tarefasEmAndamento;
    private long tarefasConcluidas;
    private long tarefasAtrasadas;
    private long tarefasParadas;
    private List<ProdutividadeItemDTO> produtividadeEquipe;
    private List<VelocidadeItemDTO> velocidadeRecente;

}
