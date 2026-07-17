package com.taskflow.backend.dto.notificacao;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificacaoResponseDTO {

    private Long id;
    private String mensagem;
    private boolean lida;
    private LocalDateTime criadoEm;
    private Long tarefaId;

}
