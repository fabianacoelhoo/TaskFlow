package com.taskflow.backend.dto.gamificacao;

import java.util.List;

public record PerfilGamificacaoResponseDTO(
        int pontos,
        long tarefasConcluidas,
        List<ConquistaDTO> conquistas
) {
}
