package com.taskflow.backend.dto.historico;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HistoricoResponseDTO {

    private Long id;
    private String acao;
    private LocalDateTime data;
    private Long tarefaId;
    private Long usuarioId;
    private String usuarioNome;

}
