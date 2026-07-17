package com.taskflow.backend.dto.ai;

import lombok.Data;

@Data
public class GerarTarefasRequestDTO {

    private String descricao;
    private Long responsavelId;

}
