package com.taskflow.backend.dto.ai;

import java.util.List;

public record PlanoGerado(List<TarefaGerada> tarefas) {

    public record TarefaGerada(String titulo, String descricao, String prioridade) {
    }
}
