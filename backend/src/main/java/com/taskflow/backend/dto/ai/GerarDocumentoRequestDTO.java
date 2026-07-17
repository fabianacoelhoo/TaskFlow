package com.taskflow.backend.dto.ai;

import com.taskflow.backend.entity.CategoriaDocumento;
import lombok.Data;

@Data
public class GerarDocumentoRequestDTO {

    private String titulo;
    private CategoriaDocumento categoria;
    private String instrucoes;

}
