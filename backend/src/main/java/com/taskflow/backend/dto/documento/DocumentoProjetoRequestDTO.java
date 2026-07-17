package com.taskflow.backend.dto.documento;

import com.taskflow.backend.entity.CategoriaDocumento;
import lombok.Data;

@Data
public class DocumentoProjetoRequestDTO {

    private String titulo;
    private CategoriaDocumento categoria;
    private String conteudo;

}
