package com.taskflow.backend.dto.ai;

import lombok.Data;

@Data
public class SugerirPrazoRequestDTO {

    private String titulo;
    private String prioridade;
    private Long responsavelId;

}
