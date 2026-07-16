package com.taskflow.backend.dto.projeto;

import lombok.Data;

@Data
public class ProjetoResponseDTO {

    private Long id;
    private String nome;
    private String descricao;
}