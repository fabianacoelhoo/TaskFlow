package com.taskflow.backend.dto.pesquisa;

import lombok.Data;

@Data
public class ResultadoPesquisaDTO {

    private String tipo;
    private Long id;
    private String titulo;
    private String trecho;
    private Long projetoId;
    private String projetoNome;

}
