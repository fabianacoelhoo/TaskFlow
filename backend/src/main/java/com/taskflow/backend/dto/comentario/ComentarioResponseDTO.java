package com.taskflow.backend.dto.comentario;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ComentarioResponseDTO {

    private Long id;
    private String texto;
    private LocalDateTime criadoEm;
    private Long tarefaId;
    private Long usuarioId;
    private String usuarioNome;

}
