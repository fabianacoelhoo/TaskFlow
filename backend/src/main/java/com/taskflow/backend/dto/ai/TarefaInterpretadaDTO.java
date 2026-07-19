package com.taskflow.backend.dto.ai;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TarefaInterpretadaDTO {

    private String titulo;
    private String descricao;
    private String prioridade;
    private LocalDate prazo;
    private Long responsavelId;
    private String nomeResponsavel;

    public TarefaInterpretadaDTO() {
    }

    public TarefaInterpretadaDTO(String titulo, String descricao, String prioridade, LocalDate prazo,
                                  Long responsavelId, String nomeResponsavel) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazo = prazo;
        this.responsavelId = responsavelId;
        this.nomeResponsavel = nomeResponsavel;
    }

}
