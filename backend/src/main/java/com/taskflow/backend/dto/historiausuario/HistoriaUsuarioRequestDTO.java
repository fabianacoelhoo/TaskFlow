package com.taskflow.backend.dto.historiausuario;

import com.taskflow.backend.entity.StatusHistoria;
import lombok.Data;

@Data
public class HistoriaUsuarioRequestDTO {

    private String titulo;
    private String descricao;
    private String criteriosAceitacao;
    private Integer pontos;
    private String prioridade;
    private StatusHistoria status;
    private Long epicoId;
    private Long sprintId;

}
