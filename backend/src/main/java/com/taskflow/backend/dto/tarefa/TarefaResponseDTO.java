package com.taskflow.backend.dto.tarefa;

import com.taskflow.backend.entity.StatusTarefa;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TarefaResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private StatusTarefa status;
    private String prioridade;
    private LocalDate prazo;
    private Long projetoId;
    private Long responsavelId;

}