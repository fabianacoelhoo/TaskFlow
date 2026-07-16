package com.taskflow.backend.dto.anexo;

import lombok.Data;

@Data
public class AnexoResponseDTO {

    private Long id;
    private String nomeArquivo;
    private Long tarefaId;

}
