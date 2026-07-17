package com.taskflow.backend.dto.ai;

import lombok.Data;

@Data
public class GerarPlanoBacklogRequestDTO {

    private String descricao;
    private Long responsavelId;

}
