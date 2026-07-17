package com.taskflow.backend.dto.gamificacao;

public record RankingItemDTO(Long usuarioId, String nome, int pontos, long tarefasConcluidas) {
}
