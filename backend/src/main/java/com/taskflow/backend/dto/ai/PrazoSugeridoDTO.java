package com.taskflow.backend.dto.ai;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PrazoSugeridoDTO {

    private LocalDate prazo;
    private String justificativa;

    public PrazoSugeridoDTO() {
    }

    public PrazoSugeridoDTO(LocalDate prazo, String justificativa) {
        this.prazo = prazo;
        this.justificativa = justificativa;
    }

}
