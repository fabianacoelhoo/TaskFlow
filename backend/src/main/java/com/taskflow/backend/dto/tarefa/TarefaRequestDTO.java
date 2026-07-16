package com.taskflow.backend.dto.tarefa;

import com.taskflow.backend.entity.StatusTarefa;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TarefaRequestDTO {

    private String titulo;
    private String descricao;
    private StatusTarefa status;
    private String prioridade;
    private LocalDate prazo;

}
