package com.taskflow.backend.dto.documento;

import com.taskflow.backend.entity.CategoriaDocumento;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentoProjetoResponseDTO {

    private Long id;
    private String titulo;
    private CategoriaDocumento categoria;
    private String conteudo;
    private Long projetoId;
    private String criadoPorNome;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

}
