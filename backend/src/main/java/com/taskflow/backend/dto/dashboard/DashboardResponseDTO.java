package com.taskflow.backend.dto.dashboard;

import lombok.Data;

@Data
public class DashboardResponseDTO {

    private long totalProjetos;
    private long totalTarefas;
    private long tarefasPendentes;
    private long tarefasEmAndamento;
    private long tarefasConcluidas;
    private long tarefasAtrasadas;

}
