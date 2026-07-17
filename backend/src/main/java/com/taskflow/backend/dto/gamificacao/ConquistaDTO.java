package com.taskflow.backend.dto.gamificacao;

import com.taskflow.backend.entity.CodigoConquista;

import java.time.LocalDateTime;

public record ConquistaDTO(
        CodigoConquista codigo,
        String nome,
        String descricao,
        boolean desbloqueada,
        LocalDateTime desbloqueadaEm
) {
}
