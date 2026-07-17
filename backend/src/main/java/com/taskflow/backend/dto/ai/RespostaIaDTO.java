package com.taskflow.backend.dto.ai;

import lombok.Data;

@Data
public class RespostaIaDTO {

    private String resposta;

    public RespostaIaDTO() {
    }

    public RespostaIaDTO(String resposta) {
        this.resposta = resposta;
    }

}
