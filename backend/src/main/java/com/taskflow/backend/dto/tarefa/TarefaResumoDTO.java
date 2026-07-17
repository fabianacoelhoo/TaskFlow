package com.taskflow.backend.dto.tarefa;

import com.taskflow.backend.entity.StatusTarefa;
import lombok.Data;

@Data
public class TarefaResumoDTO {

    private Long id;
    private String titulo;
    private StatusTarefa status;

}
