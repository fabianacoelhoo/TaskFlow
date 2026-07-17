package com.taskflow.backend.dto.ai;

import java.util.List;

public record PlanoBacklogGerado(EpicoGerado epico, List<HistoriaGerada> historias, List<String> riscos) {

    public record EpicoGerado(String titulo, String descricao) {
    }

    public record HistoriaGerada(
            String titulo,
            String descricao,
            String criteriosAceitacao,
            String prioridade,
            Integer pontos,
            List<String> tarefas
    ) {
    }
}
