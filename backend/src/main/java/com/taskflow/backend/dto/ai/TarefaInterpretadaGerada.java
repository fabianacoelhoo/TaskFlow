package com.taskflow.backend.dto.ai;

public record TarefaInterpretadaGerada(
        String titulo,
        String descricao,
        String prioridade,
        String prazo,
        Long responsavelId) {
}
