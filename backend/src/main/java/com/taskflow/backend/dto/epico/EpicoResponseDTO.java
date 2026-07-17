package com.taskflow.backend.dto.epico;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EpicoResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private Long projetoId;
    private LocalDateTime criadoEm;

}
