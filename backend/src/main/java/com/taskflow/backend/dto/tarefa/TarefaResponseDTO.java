package com.taskflow.backend.dto.tarefa;

import com.taskflow.backend.dto.tag.TagResponseDTO;
import com.taskflow.backend.entity.StatusTarefa;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

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
    private List<TagResponseDTO> tags;
    private List<TarefaResumoDTO> dependencias;
    private Long historiaUsuarioId;

}
