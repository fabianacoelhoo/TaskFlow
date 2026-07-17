package com.taskflow.backend.dto.historiausuario;

import com.taskflow.backend.entity.StatusHistoria;
import lombok.Data;

@Data
public class HistoriaUsuarioResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private String criteriosAceitacao;
    private Integer pontos;
    private String prioridade;
    private StatusHistoria status;
    private Long projetoId;
    private Long epicoId;
    private Long sprintId;

}
